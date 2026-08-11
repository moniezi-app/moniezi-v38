/**
 * MONIEZI License Worker
 *
 * MONIEZI-controlled license registry held in Cloudflare Workers KV and fulfilled by Stripe Checkout webhooks.
 *
 * Routes
 *   POST /validate          Called by the MONIEZI app.
 *   POST /stripe/webhook    Called by Stripe. Mints and revokes licenses.
 *   POST /admin/lookup      Owner only. Find a license by email or key.
 *   POST /admin/issue       Owner only. Manually mint a license (fallback / comped).
 *   POST /admin/status      Owner only. Set active | refunded | disputed | revoked.
 *   POST /admin/reset-devices  Owner only. Clear bound devices for a license.
 *   GET  /health            Liveness probe. No secrets returned.
 *
 * KV layout (single namespace: moniezi-license-bindings)
 *   license:<hash>        full license record
 *   session:<sessionId>   -> hash        (Stripe idempotency)
 *   email:<emailHash>     -> [hash, ...] (support lookup)
 */

const VERSION = "37.0.0";

/* ------------------------------------------------------------------ utils */

const jsonResponse = (body, status, corsOrigin) => {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (corsOrigin) {
    headers["access-control-allow-origin"] = corsOrigin;
    headers["access-control-allow-methods"] = "POST, OPTIONS";
    headers["access-control-allow-headers"] = "content-type";
    headers["vary"] = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
};

const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

/** Constant-time-ish comparison via equal-length hashes. */
const secureEqual = async (left, right) => {
  if (!left || !right) return false;
  const [a, b] = await Promise.all([sha256Hex(left), sha256Hex(right)]);
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const allowedOriginFor = (request, env) => {
  const requestOrigin = (request.headers.get("Origin") || "").trim();
  const configured = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!configured.length || !requestOrigin) return "";
  return configured.includes(requestOrigin) ? requestOrigin : "";
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

/* ------------------------------------------------------- license identity */

// The salt keeps stored hashes useless outside this deployment.
// It replaces the old `${productId}:${key}` scheme.
const licenseHashFor = async (env, licenseKey) => {
  const salt = String(env.LICENSE_HASH_SALT || "").trim();
  if (!salt) throw new Error("LICENSE_HASH_SALT is not configured");
  return sha256Hex(`moniezi:v1:${salt}:${licenseKey.toUpperCase()}`);
};

// Ambiguous characters removed (no 0/O/1/I). Result matches the app's
// customer key pattern: /^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/
const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateLicenseKey = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const chars = [...bytes].map((b) => KEY_ALPHABET[b % KEY_ALPHABET.length]);
  const groups = [];
  for (let i = 0; i < 20; i += 5) groups.push(chars.slice(i, i + 5).join(""));
  return `MZ-${groups.join("-")}`; // MZ-XXXXX-XXXXX-XXXXX-XXXXX
};

const readLicense = async (env, hash) => env.LICENSE_BINDINGS.get(`license:${hash}`, "json");

const writeLicense = async (env, hash, record) =>
  env.LICENSE_BINDINGS.put(`license:${hash}`, JSON.stringify(record));

const indexByEmail = async (env, email, hash) => {
  const emailHash = await sha256Hex(`email:${normalizeEmail(email)}`);
  const key = `email:${emailHash}`;
  const existing = (await env.LICENSE_BINDINGS.get(key, "json")) || [];
  const list = Array.isArray(existing) ? existing : [];
  if (!list.includes(hash)) {
    list.push(hash);
    await env.LICENSE_BINDINGS.put(key, JSON.stringify(list));
  }
};

const findByEmail = async (env, email) => {
  const emailHash = await sha256Hex(`email:${normalizeEmail(email)}`);
  const list = (await env.LICENSE_BINDINGS.get(`email:${emailHash}`, "json")) || [];
  const records = [];
  for (const hash of Array.isArray(list) ? list : []) {
    const record = await readLicense(env, hash);
    if (record) records.push({ hash, ...record });
  }
  return records;
};

/* --------------------------------------------------------- license minting */

const issueLicense = async (env, { email, sessionId, paymentIntentId, amountTotal, currency, source }) => {
  // Idempotency: Stripe can deliver the same event more than once.
  if (sessionId) {
    const existingHash = await env.LICENSE_BINDINGS.get(`session:${sessionId}`);
    if (existingHash) {
      const existing = await readLicense(env, existingHash);
      if (existing) return { licenseKey: null, hash: existingHash, record: existing, reused: true };
    }
  }

  const licenseKey = generateLicenseKey();
  const hash = await licenseHashFor(env, licenseKey);

  const record = {
    email: normalizeEmail(email),
    stripeSessionId: sessionId || "",
    stripePaymentIntentId: paymentIntentId || "",
    amountTotal: typeof amountTotal === "number" ? amountTotal : null,
    currency: currency || "",
    purchaseDate: new Date().toISOString(),
    status: "active", // active | refunded | disputed | revoked
    maxDevices: Math.max(1, Math.min(10, Number(env.MAX_DEVICES || 3))),
    devices: [],
    source: source || "stripe",
    updatedAt: new Date().toISOString(),
  };

  await writeLicense(env, hash, record);
  if (sessionId) await env.LICENSE_BINDINGS.put(`session:${sessionId}`, hash);
  if (paymentIntentId) await env.LICENSE_BINDINGS.put(`pi:${paymentIntentId}`, hash);
  if (record.email) await indexByEmail(env, record.email, hash);

  return { licenseKey, hash, record, reused: false };
};

/* ------------------------------------------------------------- email send */

/**
 * Delivers the purchase email through Resend. Optional: if RESEND_API_KEY is
 * absent the license is still minted and retrievable via /admin/lookup, so the
 * first few sales can be fulfilled by hand without losing the sale.
 */
const sendLicenseEmail = async (env, { to, licenseKey }) => {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  if (!apiKey || !to || !licenseKey) return { sent: false, reason: "email_not_configured" };

  const appUrl = String(env.APP_URL || "").trim();
  const supportEmail = String(env.SUPPORT_EMAIL || "").trim();
  const refundUrl = String(env.REFUND_URL || "").trim();
  const installUrl = String(env.INSTALL_URL || appUrl).trim();
  const from = String(env.EMAIL_FROM || "MONIEZI <noreply@moniezi.com>").trim();

  const text = [
    "Thank you for your MONIEZI purchase.",
    "",
    `Your license key: ${licenseKey}`,
    "",
    `1. Open MONIEZI: ${appUrl}`,
    "2. Enter the license key above.",
    `3. Install it to your device (instructions: ${installUrl}).`,
    "4. Create your first backup from Settings > Backup. Your records are stored on your device, so the backup is your safety net.",
    "",
    "Your key works on up to 3 devices. Need a device reset or having trouble?",
    `Email ${supportEmail}.`,
    "",
    `Refund policy (7 days): ${refundUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#0f172a">
      <h2 style="margin:0 0 16px">Thank you for your MONIEZI purchase</h2>
      <p style="margin:0 0 8px">Your license key:</p>
      <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px;font-weight:700;
                background:#f1f5f9;padding:14px 18px;border-radius:8px;letter-spacing:1px;margin:0 0 24px">
        ${licenseKey}
      </p>
      <p style="margin:0 0 24px">
        <a href="${appUrl}" style="background:#0f172a;color:#fff;text-decoration:none;
           padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">Open MONIEZI</a>
      </p>
      <ol style="margin:0 0 24px;padding-left:20px;line-height:1.7">
        <li>Open MONIEZI and enter the license key above.</li>
        <li><a href="${installUrl}">Install it to your device</a> (Windows, Android, or iPhone).</li>
        <li><strong>Create your first backup</strong> from Settings &gt; Backup. Your records stay on your
            device, so the backup is your safety net.</li>
      </ol>
      <p style="margin:0 0 8px;color:#475569">Your key works on up to 3 devices.</p>
      <p style="margin:0 0 8px;color:#475569">
        Questions or a device reset? Email <a href="mailto:${supportEmail}">${supportEmail}</a>.
      </p>
      <p style="margin:0;color:#475569"><a href="${refundUrl}">7-day refund policy</a></p>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Your MONIEZI license key",
        text,
        html,
      }),
    });
    if (!response.ok) {
      return { sent: false, reason: `email_provider_${response.status}` };
    }
    return { sent: true };
  } catch {
    return { sent: false, reason: "email_request_failed" };
  }
};

/* ------------------------------------------------- stripe signature check */

const verifyStripeSignature = async (payload, signatureHeader, secret, toleranceSeconds = 300) => {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    if (!k || !v) return acc;
    const key = k.trim();
    if (key === "v1") (acc.v1 ||= []).push(v.trim());
    else acc[key] = v.trim();
    return acc;
  }, {});

  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > toleranceSeconds) return false;
  if (!parts.v1 || !parts.v1.length) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  for (const candidate of parts.v1) {
    if (candidate.length !== expected.length) continue;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff === 0) return true;
  }
  return false;
};

/* --------------------------------------------------------------- handlers */

const handleValidate = async (request, env, corsOrigin) => {
  if (!corsOrigin) return jsonResponse({ valid: false, error: "origin_not_allowed" }, 403, "");

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ valid: false, error: "invalid_json" }, 400, corsOrigin);
  }

  const licenseKey = String(payload?.license_key || "").trim();
  const deviceId = String(payload?.device_id || "").trim();

  if (!/^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/.test(licenseKey)) {
    return jsonResponse({ valid: false, error: "invalid_license_format" }, 400, corsOrigin);
  }
  if (!/^mzd_[A-Za-z0-9_-]{8,160}$/.test(deviceId)) {
    return jsonResponse({ valid: false, error: "invalid_device" }, 400, corsOrigin);
  }

  // Owner key: private testing key stored only as a Cloudflare secret.
  // Never consumes a customer device slot.
  const ownerKey = String(env.OWNER_KEY || "").trim();
  if (ownerKey && (await secureEqual(licenseKey, ownerKey))) {
    return jsonResponse(
      { valid: true, licenseType: "owner", purchaseDate: new Date().toISOString() },
      200,
      corsOrigin
    );
  }

  if (!String(env.LICENSE_HASH_SALT || "").trim()) {
    return jsonResponse({ valid: false, error: "server_not_configured" }, 503, corsOrigin);
  }

  const hash = await licenseHashFor(env, licenseKey);
  const record = await readLicense(env, hash);

  if (!record) return jsonResponse({ valid: false }, 200, corsOrigin);
  if (record.status !== "active") {
    return jsonResponse({ valid: false, error: "license_revoked" }, 200, corsOrigin);
  }

  const maxDevices = Math.max(1, Math.min(10, Number(record.maxDevices || env.MAX_DEVICES || 3)));
  const devices = Array.isArray(record.devices) ? record.devices.filter(Boolean) : [];
  const alreadyBound = devices.includes(deviceId);

  if (!alreadyBound && devices.length >= maxDevices) {
    return jsonResponse({ valid: false, error: "device_limit_reached" }, 200, corsOrigin);
  }

  if (!alreadyBound) {
    devices.push(deviceId);
    await writeLicense(env, hash, {
      ...record,
      devices,
      updatedAt: new Date().toISOString(),
    });
  }

  return jsonResponse(
    {
      valid: true,
      licenseType: "customer",
      email: record.email || "",
      purchaseDate: record.purchaseDate || "",
      devicesUsed: devices.length,
      maxDevices,
    },
    200,
    corsOrigin
  );
};

const setStatusByPaymentIntent = async (env, paymentIntentId, status) => {
  if (!paymentIntentId) return false;
  const hash = await env.LICENSE_BINDINGS.get(`pi:${paymentIntentId}`);
  if (!hash) return false;
  const record = await readLicense(env, hash);
  if (!record) return false;
  await writeLicense(env, hash, { ...record, status, updatedAt: new Date().toISOString() });
  return true;
};

const handleStripeWebhook = async (request, env) => {
  const secret = String(env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) return jsonResponse({ error: "webhook_not_configured" }, 503, "");

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  const verified = await verifyStripeSignature(rawBody, signature, secret);
  if (!verified) return jsonResponse({ error: "invalid_signature" }, 400, "");

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, "");
  }

  const object = event?.data?.object || {};

  switch (event?.type) {
    case "checkout.session.completed": {
      // Only fulfil once payment has actually cleared.
      if (object.payment_status !== "paid") break;

      const email =
        object.customer_details?.email || object.customer_email || "";

      const { licenseKey, reused, record } = await issueLicense(env, {
        email,
        sessionId: object.id,
        paymentIntentId:
          typeof object.payment_intent === "string"
            ? object.payment_intent
            : object.payment_intent?.id || "",
        amountTotal: object.amount_total,
        currency: object.currency,
        source: "stripe",
      });

      if (!reused && licenseKey && email) {
        const emailResult = await sendLicenseEmail(env, { to: email, licenseKey });
        if (!emailResult.sent) {
          // Surfaced in `wrangler tail`. The license exists either way; recover
          // it with /admin/lookup and send the key manually.
          console.error(
            `MONIEZI: license minted but email not sent (${emailResult.reason}) session=${object.id}`
          );
        }
      }
      if (reused) console.log(`MONIEZI: duplicate webhook ignored for session=${object.id}`);
      if (!email) console.error(`MONIEZI: no email on session=${object.id}; record=${record.status}`);
      break;
    }

    case "charge.refunded":
    case "refund.created": {
      const paymentIntentId =
        typeof object.payment_intent === "string"
          ? object.payment_intent
          : object.payment_intent?.id || "";
      await setStatusByPaymentIntent(env, paymentIntentId, "refunded");
      break;
    }

    case "charge.dispute.created": {
      const paymentIntentId =
        typeof object.payment_intent === "string"
          ? object.payment_intent
          : object.payment_intent?.id || "";
      await setStatusByPaymentIntent(env, paymentIntentId, "disputed");
      break;
    }

    default:
      break;
  }

  // Always 200 on a verified event so Stripe does not retry indefinitely.
  return jsonResponse({ received: true }, 200, "");
};

const requireAdmin = async (request, env) => {
  const adminKey = String(env.ADMIN_KEY || "").trim();
  if (!adminKey) return false;
  const header = request.headers.get("authorization") || "";
  const presented = header.replace(/^Bearer\s+/i, "").trim();
  return secureEqual(presented, adminKey);
};

const handleAdmin = async (request, env, action) => {
  if (!(await requireAdmin(request, env))) {
    return jsonResponse({ error: "unauthorized" }, 401, "");
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400, "");
  }

  const resolveHash = async () => {
    if (payload?.license_key) return licenseHashFor(env, String(payload.license_key).trim());
    if (payload?.hash) return String(payload.hash).trim();
    return "";
  };

  switch (action) {
    case "lookup": {
      if (payload?.email) {
        const records = await findByEmail(env, payload.email);
        return jsonResponse({ found: records.length, records }, 200, "");
      }
      const hash = await resolveHash();
      if (!hash) return jsonResponse({ error: "email_or_license_key_required" }, 400, "");
      const record = await readLicense(env, hash);
      return jsonResponse({ found: record ? 1 : 0, records: record ? [{ hash, ...record }] : [] }, 200, "");
    }

    case "issue": {
      const email = normalizeEmail(payload?.email);
      if (!email) return jsonResponse({ error: "email_required" }, 400, "");
      const { licenseKey, hash, record } = await issueLicense(env, {
        email,
        sessionId: payload?.session_id || "",
        paymentIntentId: payload?.payment_intent_id || "",
        source: payload?.source || "manual",
      });
      if (payload?.send_email === true && licenseKey) {
        await sendLicenseEmail(env, { to: email, licenseKey });
      }
      // The plaintext key is returned exactly once and never stored.
      return jsonResponse({ licenseKey, hash, record }, 200, "");
    }

    case "status": {
      const status = String(payload?.status || "").trim();
      if (!["active", "refunded", "disputed", "revoked"].includes(status)) {
        return jsonResponse({ error: "invalid_status" }, 400, "");
      }
      const hash = await resolveHash();
      const record = hash ? await readLicense(env, hash) : null;
      if (!record) return jsonResponse({ error: "not_found" }, 404, "");
      const updated = { ...record, status, updatedAt: new Date().toISOString() };
      await writeLicense(env, hash, updated);
      return jsonResponse({ hash, record: updated }, 200, "");
    }

    case "reset-devices": {
      const hash = await resolveHash();
      const record = hash ? await readLicense(env, hash) : null;
      if (!record) return jsonResponse({ error: "not_found" }, 404, "");
      const updated = { ...record, devices: [], updatedAt: new Date().toISOString() };
      await writeLicense(env, hash, updated);
      return jsonResponse({ hash, record: updated }, 200, "");
    }

    default:
      return jsonResponse({ error: "not_found" }, 404, "");
  }
};

/* ----------------------------------------------------------------- router */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsOrigin = allowedOriginFor(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": corsOrigin || "null",
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
          vary: "Origin",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          version: VERSION,
          licensing: String(env.LICENSE_HASH_SALT || "").trim() ? "configured" : "not_configured",
          webhook: String(env.STRIPE_WEBHOOK_SECRET || "").trim() ? "configured" : "not_configured",
          email: String(env.RESEND_API_KEY || "").trim() ? "configured" : "manual_fallback",
        },
        200,
        ""
      );
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "not_found" }, 404, corsOrigin);
    }

    if (url.pathname === "/validate") return handleValidate(request, env, corsOrigin);
    if (url.pathname === "/stripe/webhook") return handleStripeWebhook(request, env);

    if (url.pathname.startsWith("/admin/")) {
      return handleAdmin(request, env, url.pathname.slice("/admin/".length));
    }

    return jsonResponse({ error: "not_found" }, 404, corsOrigin);
  },
};
