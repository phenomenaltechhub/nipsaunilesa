# Future server configuration and costs

Documentation only. No backend has been provisioned, no secret bindings are configured, and no production credentials are needed for this milestone. The public PWA shell must never receive secret environment values. Do not add `NEXT_PUBLIC_` secret variables or put credentials in HTML, manifests, JavaScript, build artifacts, screenshots or logs.

Candidate server-only variable names (final format depends on validated hosting):

| Name | Purpose | Safe documentation placeholder |
| --- | --- | --- |
| `APP_ORIGIN` | Exact approved app origin for redirect/CSRF/CORS policy | `https://app.example.invalid` |
| `DATABASE_DSN`, `DATABASE_USER`, `DATABASE_PASSWORD` | Least-privilege database connection, outside web root | Configure privately on the server; no value in source |
| `SESSION_SECRET` | Server session protection; rotate safely | Generate securely during authorised setup |
| `PAYSTACK_SECRET_KEY` | Trusted provider verification only | Configure privately after merchant approval |
| `PAYMENT_WEBHOOK_SECRET` | Provider-specific webhook verification, where applicable | Confirm provider requirements before configuration |
| `MAIL_TRANSPORT`, `MAIL_CREDENTIAL` | Institutional ownership/recovery delivery | Choose approved service and inject credentials privately |
| `PRIVATE_STORAGE_PATH` | Protected uploads/originals, not public assets | Server path outside document root |
| `BACKUP_KEY_REFERENCE` | Access-controlled encryption/key reference | Private key management; never a key in source |

Do not assume these names alone make the system safe. Validate secret generation, entropy, rotation, host permissions, recovery and deployment handling. Paystack's current signature procedure may use its server secret rather than a separate webhook secret; implement the documented provider method after review, never invent a signing scheme. No `.env` with values is supplied.

Before email integration, obtain institutional sender/domain approval, validate delivery, retry/rate limits, abuse protection and generic responses, and explain any hosting/SMTP/provider costs. Email ownership verification belongs to future **activation**, not earlier dues registration. No email provider or paid subscription is selected here.

Smartweb hosting, storage/scanning, offsite backups, email and external real-time messaging may have costs and technical limits. Confirm plan capabilities and recurring charges with the owner before provisioning. No paid service or external subscription is introduced by the plain-JavaScript shell or existing development tools.
