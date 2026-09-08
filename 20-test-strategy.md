# Test Strategy

## Core workflow tests

1. Create product.
2. Receive shipment.
3. Verify stock increased.
4. Verify stock shows Dozen + Pieces and Total Pieces correctly.
5. Create direct sale.
6. Verify stock decreased.
7. Mark invoice Paid, Partial and Pending in separate scenarios.
8. Record later payment.
9. Verify outstanding and status update.
10. Open WhatsApp reminder for pending balance.
11. Record expense.
12. Verify reports.
13. Print invoice.

## Quantity tests

Test:

- Pieces only.
- Dozens only.
- Mixed Dozen + Pieces.
- Boundary conversion: 11 Pcs, 12 Pcs, 13 Pcs, 24 Pcs, 25 Pcs.
- Inventory formatting after multiple purchases and sales.

## Two-owner tests

- Both owners can access all modules.
- Actions are attributed to correct owner.
- Concurrent edits/posting do not duplicate stock or payments.

## UX acceptance for 50+ users

Both owners should be able to complete these tasks after a short introduction without assistance:

- Receive shipment.
- Find article number.
- Create invoice.
- Mark pending payment.
- Open WhatsApp reminder.
- Receive later payment.

Observe confusing labels, tiny controls, unnecessary screens and keyboard-flow issues as defects.

## Print tests

Test English + Arabic invoice with short/long descriptions, many lines, K.D. decimals, pending balance and printer/PDF output.
