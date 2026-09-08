# Nonfunctional and Security Requirements

## Reliability

- Posted stock and invoice data must not be lost through accidental edits.
- Use transactional database operations for posting purchase receipt, invoice and payment.
- Maintain regular backups and test restore procedure.
- Prevent duplicate posting caused by double-click/retry.

## Security

- Two separate authenticated owner accounts.
- Secure password hashing.
- HTTPS in production.
- Session expiry and logout.
- Audit log for sensitive actions.
- Attachment validation.

## Performance

- Article-number search should feel immediate on normal office internet/local network.
- Common transaction screens should load quickly.
- Posting should show progress and prevent repeated clicks.

## Accessibility for 50+ users

- Large readable text and controls.
- High contrast.
- Visible keyboard focus.
- No core action hidden behind hover-only behaviour.
- Clear success/error messages.
- Responsive design for desktop and tablet; desktop is the primary operating target unless deployment changes.

## Data integrity

Stock ledger and payment allocation must remain reconcilable. Reports must derive from posted valid transactions only.
