# MONIEZI License Worker

Cloudflare Worker/KV license registry fulfilled by Stripe Checkout webhooks.

## Routes

| Route | Caller | Purpose |
|---|---|---|
| `POST /validate` | MONIEZI app | Validate key and bind a device (subject to the configured device limit) |
| `POST /stripe/webhook` | Stripe | Mint a license on paid Checkout; update status on refund/dispute |
| `POST /admin/lookup` | Owner | Find a license by email or key |
| `POST /admin/issue` | Owner | Manually mint a license |
| `POST /admin/status` | Owner | Set active / refunded / disputed / revoked |
| `POST /admin/reset-devices` | Owner | Clear bound devices for a license |
| `GET /health` | Anyone | Return configuration status without exposing secrets |

## Secrets

Set with Cloudflare/Wrangler; never commit these values:

| Secret | Required | Notes |
|---|---|---|
| `LICENSE_HASH_SALT` | Yes | Random 32+ chars. Changing it invalidates existing issued licenses. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`). |
| `ADMIN_KEY` | Yes | Random 32+ chars; bearer token for `/admin/*`. |
| `OWNER_KEY` | No | Private owner activation key. |
| `RESEND_API_KEY` | No | Enables automatic license email delivery; otherwise use manual fulfillment. |

## Stripe webhook

Endpoint:

`https://YOUR-WORKER.workers.dev/stripe/webhook`

Subscribe to:
- `checkout.session.completed`
- `charge.refunded`
- `charge.dispute.created`

Paid Checkout sessions are fulfilled idempotently. If email delivery fails, the license remains minted and can be recovered through `/admin/lookup`.

## Launch checks

- Rate-limit `POST /validate` at Cloudflare.
- Test valid/invalid/refunded keys, device limit, reinstall, and offline behavior.
- Confirm `ALLOWED_ORIGIN` includes every production origin serving the PWA.
- Confirm `APP_URL` and support/refund/install links are customer-facing production URLs.
