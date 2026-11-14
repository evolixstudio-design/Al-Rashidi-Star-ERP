# Local WhatsApp invoice sharing

The QR connection is disabled in production and uses only this PC. No database migration is required. The existing hosted plans are unchanged.

In `backend/.env.local`, alongside the **local** database URL, set:

```dotenv
WHATSAPP_WEB_ENABLED=true
WHATSAPP_CHROME_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe
```

Run the backend and frontend locally. Sign in as admin, open **Settings → WhatsApp → Connect WhatsApp**, then scan the QR code using the phone's **Linked devices → Link a device**. Wait for **Connected**.

The invoice's **WhatsApp Customer** and **Payment Reminder** buttons send its image and receipt/reminder as one message. Invoice-linked receipts in Payments work the same way. Customer and dashboard reminders send each unpaid invoice image with its own reminder caption; progress shows the count and stops on a failure. Payments with no linked invoice retain their existing text confirmation. Opening balances alone cannot have an invoice image.

Eight-digit phone numbers default to Kuwait (`+965`). International numbers retain their country code: use `+91…`, `0091…`, `+977…`, etc. Only numbers registered on WhatsApp can receive a message. Recipients never need to link their account to the ERP.

QR credentials stay in `backend/.wwebjs_auth/`; this folder and the browser cache are ignored by Git. Never upload or share the session folder. Disconnect in Settings to unlink it. Normal shutdown preserves the link for the next startup.

This is an unofficial WhatsApp Web integration; WhatsApp can restrict the account or change its web interface. Keep this PC and the backend running. Do not enable it on the current hosted backend without a separate deployment review.

The dependency audit reports upstream vulnerabilities in the WhatsApp library's dependency tree. Production dependency hardening remains part of the deployment review.

Automated checks mock WhatsApp and never contact a customer. After linking, verify image + caption using an invoice addressed to a test number you control before using it with customers.
