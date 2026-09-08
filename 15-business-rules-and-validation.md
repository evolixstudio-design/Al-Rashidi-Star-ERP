# Business Rules and Validation

1. Article number must be unique.
2. One dozen equals 12 pieces in Version 1.
3. Stock is stored internally as total pieces.
4. User-facing stock always displays Dozen + Pieces and Total Pieces.
5. Purchase/shipment quantity must be zero or positive during draft and greater than zero for a posted line.
6. Sales quantity must be greater than zero.
7. Product, quantity and price are required before posting a line.
8. Inactive products cannot be received or sold.
9. Normal sales cannot produce negative stock. If a future override is added it must require explicit confirmation and audit logging.
10. Draft invoice changes no stock.
11. Posted invoice deducts stock immediately.
12. Posted shipment receipt adds stock immediately.
13. Posted records cannot be silently edited or deleted.
14. Cancellation/reversal/adjustment requires a reason.
15. Invoice and purchase receipt numbers are unique.
16. Article-number exact match has priority in product search.
17. Selling price may be changed by either owner; final sold price is stored on the invoice line and change is auditable.
18. Payment status rules: Paid = outstanding 0; Partial = received > 0 and outstanding > 0; Pending = received 0 and outstanding > 0.
19. Receiving later payment recalculates outstanding and status automatically.
20. WhatsApp reminder is available only when customer phone exists and outstanding amount is greater than zero.
21. Version 1 WhatsApp action opens a prefilled chat; it does not silently auto-send.
