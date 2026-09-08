# Final Decision Log

## Locked decisions

1. The product is Rashidi Traders ERP for a Kuwait trading business.
2. There are exactly two normal users and both are owners.
3. Both owners have equal full access.
4. No staff/manager/accounts/store role system is required in Version 1.
5. The application UI uses simple Hinglish.
6. Customer-facing invoice remains English + Arabic.
7. Main users are 50+, so large readable UI and minimal steps are mandatory.
8. Supplier article number is the primary product identifier.
9. One dozen equals 12 pieces in Version 1.
10. Stock is stored internally as total pieces.
11. Inventory always shows Dozen + Pieces and Total Pieces.
12. Normal shipment workflow is Receive Shipment -> Review -> Receive & Add to Stock.
13. No separate manual stock entry is required after receiving a shipment.
14. Normal sales use Direct Invoice; Sales Order is optional/secondary.
15. Posting invoice deducts stock automatically.
16. Payment statuses are Paid, Partial and Pending.
17. Pending/partial invoices contribute to customer outstanding.
18. WhatsApp Reminder opens a prefilled chat; owner manually sends it.
19. Posted transactions are corrected through cancellation/reversal/adjustment, not silent edit/delete.
20. Audit records which owner performed important actions.

## Non-blocking items to confirm during implementation

These do not block starting development because the system can keep them configurable:

- Final company English/Arabic identity and logo.
- Exact English/Arabic invoice wording and terms.
- Final invoice reference sample/sign-off.
- Final list of expense categories.
- Exact payment methods used by the business (Cash, Bank, KNET, Cheque, etc.).
- Whether colour/size needs separate stock rows for specific products.

## Final core workflow

China Shipment -> Receive Shipment -> Enter Actual Products -> Review -> Add to Stock -> Customer Sale -> New Invoice -> Paid / Partial / Pending -> If Outstanding, WhatsApp Reminder -> Receive Payment -> Paid -> Reports updated automatically.

This workflow is the approved development baseline unless the owner explicitly changes it later.
