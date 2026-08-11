# MONIEZI Deployment and License Setup

This source uses GitHub Pages for the Vite PWA and a Cloudflare Worker/KV license registry fulfilled by Stripe Checkout webhooks.

## 1. Deploy the license Worker

1. Open the `license-worker` directory.
2. Create/bind the Cloudflare KV namespace used as `LICENSE_BINDINGS` and put its namespace ID in `license-worker/wrangler.jsonc`.
3. Confirm the public Worker variables in `wrangler.jsonc`:
   - `ALLOWED_ORIGIN`: exact browser origin serving MONIEZI, without a path.
   - `APP_URL`: customer app URL used in license emails.
   - `INSTALL_URL`, `REFUND_URL`, `SUPPORT_EMAIL`, `EMAIL_FROM`.
4. Add Worker secrets with Wrangler/Cloudflare. Never commit them:
   - `LICENSE_HASH_SALT` — required; changing it invalidates existing customer licenses.
   - `STRIPE_WEBHOOK_SECRET` — required for Stripe fulfillment.
   - `ADMIN_KEY` — required for `/admin/*` support actions.
   - `OWNER_KEY` — optional private owner activation key.
   - `RESEND_API_KEY` — optional; without it, licenses can be sent manually after lookup.
5. Deploy the Worker and verify `GET /health`.

## 2. Configure Stripe

Create the MONIEZI Stripe Checkout payment link/product used for customer purchases.

Configure a Stripe webhook endpoint:

`https://YOUR-WORKER.workers.dev/stripe/webhook`

Subscribe to:
- `checkout.session.completed`
- `charge.refunded`
- `charge.dispute.created`

Copy the Stripe webhook signing secret into the Worker secret `STRIPE_WEBHOOK_SECRET`.

The Worker mints a license only after a paid Checkout session. Refund/dispute events update license status. If email delivery is not configured or fails, use the admin lookup route to recover the issued license and send it manually.

## 3. Configure GitHub repository variables

In GitHub repository Settings > Secrets and variables > Actions > Variables, set the public build values used by `.github/workflows/deploy-pages.yml`:

- `VITE_LICENSE_API_BASE` — deployed Cloudflare Worker base URL.
- `VITE_PURCHASE_URL` — Stripe Checkout/payment link.
- `VITE_TERMS_URL` — published terms URL.
- `VITE_PRIVACY_URL` — published privacy URL.
- `VITE_SUPPORT_EMAIL` — customer support email.

These are public build-time values. Do not put Stripe/Cloudflare secrets in GitHub build variables or any `VITE_` variable.

## 4. Deploy the PWA

1. Push the source to the GitHub repository.
2. Enable GitHub Pages with **GitHub Actions** as the source.
3. Run the `Deploy Vite app to GitHub Pages` workflow.
4. Open the deployed app and test activation, demo loading, offline launch, and update behavior.

The current Worker configuration uses `https://moniezi-app.github.io/moniezi-v38/` as `APP_URL` for license emails. If MONIEZI moves to `https://app.moniezi.com` or another production URL, update `APP_URL`, `ALLOWED_ORIGIN`, and the relevant GitHub variables before selling.

## 5. Owner-key handling

`OWNER_KEY` is a private master activation key intended only for the owner/testing. Keep it out of GitHub, screenshots, support messages, and customer packages. Rotate it immediately if it is exposed.
