# MONIEZI License Worker v37.0.0

Stripe-fulfilled, MONIEZI-controlled license registry on Cloudflare Workers KV.
Replaces the v36 Gumroad verification path. **No MONIEZI app changes are required**
— the `POST /validate` request and response contract is unchanged.

## Routes

| Route | Caller | Purpose |
|---|---|---|
| `POST /validate` | MONIEZI app | Validate key, bind device (max 3) |
| `POST /stripe/webhook` | Stripe | Mint license on payment; revoke on refund/dispute |
| `POST /admin/lookup` | Owner | Find license by email or key |
| `POST /admin/issue` | Owner | Manually mint a license |
| `POST /admin/status` | Owner | active / refunded / disputed / revoked |
| `POST /admin/reset-devices` | Owner | Clear bound devices |
| `GET /health` | Anyone | Configuration status, no secrets |

## Secrets (`npx wrangler secret put NAME`)

| Secret | Required | Notes |
|---|---|---|
| `LICENSE_HASH_SALT` | Yes | Random 32+ chars. **Changing it invalidates every issued license.** |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_...` from Stripe > Developers > Webhooks |
| `ADMIN_KEY` | Yes | Random 32+ chars. Bearer token for `/admin/*` |
| `OWNER_KEY` | No | Your private activation key. Bypasses the registry, uses no device slot |
| `RESEND_API_KEY` | No | Omit to fulfil sales manually via `/admin/lookup` |

Never place these in `wrangler.jsonc`, `.env`, GitHub variables, or app source.

## Stripe webhook events to subscribe

`checkout.session.completed`, `charge.refunded`, `charge.dispute.created`

Endpoint URL: `https://<worker>.workers.dev/stripe/webhook`

## Behaviour notes

- Sessions are only fulfilled when `payment_status === "paid"`.
- Replayed webhooks are idempotent via `session:<id>` in KV.
- If email delivery fails the license is still minted; recover it with
  `/admin/lookup` and send the key by hand. The sale is never lost.
- KV stores a salted one-way hash of the key, never the plaintext key.
  Plaintext is returned exactly once, by `/admin/issue`.

## Before public launch

1. Enable a Cloudflare rate-limiting rule on `POST /validate`.
2. Test: valid key, invalid key, refunded key, device limit, reinstall, offline.
3. Confirm `ALLOWED_ORIGIN` lists every origin the PWA is served from.
