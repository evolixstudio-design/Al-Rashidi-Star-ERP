# AI Build Guide

## Requirement source

Use this finalized spec pack as the development source of truth. Do not reintroduce staff roles, Arabic application UI or manual stock duplication unless the owner explicitly changes the requirement later.

## Build order

1. Foundation: project setup, database, two-owner authentication, Hinglish shell, company settings and audit.
2. Product master and inventory ledger with Dozen + Pieces display.
3. Suppliers and Receive Shipment workflow.
4. Customers and Direct Invoice workflow.
5. Paid / Partial / Pending payment logic and Receive Payment.
6. WhatsApp click-to-chat reminder.
7. Expenses.
8. Reports and dashboard.
9. English + Arabic invoice print service.
10. Import, backup, UX polish and final acceptance testing.

## Engineering rules

- Stock changes only through posted ledger-backed transactions.
- Purchase receipt and invoice posting are atomic database transactions.
- Money uses fixed decimals.
- Base stock uses integer pieces.
- Dozen/Pieces is a presentation and input conversion layer.
- Prevent double submission.
- Keep print generation isolated.
- All error messages shown to users use simple Hinglish.
- Each module includes automated tests and manual acceptance checks.

## Definition of done for each module

- Feature works end to end.
- Validation exists.
- Automated tests pass.
- No duplicate stock/payment side effects.
- UI is usable with keyboard and mouse.
- 50+ readability checked.
- Audit behaviour checked where relevant.
- Dead code/debug output removed.
