# Functional Requirements Catalog

## Home

Show only the most useful information for the two owners:

- Today's / selected-period sales.
- Pending customer amount.
- Low-stock count.
- Optional purchases and expenses summary.
- Recent transactions.

Quick actions: New Sale / Invoice, Receive Shipment, Receive Payment, Add Expense and Search.

## Products and stock

- Create product by supplier article number.
- Search by article number or product name.
- Maintain purchase price, selling price, category, colour/size if used and reorder level.
- Store stock internally in pieces.
- Display stock as both `X Dozen Y Pcs` and `Total Z Pcs`.
- Keep an append-only stock ledger.

## Purchases / shipment receiving

- Choose supplier.
- Enter shipment/container/reference/date.
- Add products using article number.
- Enter received quantity using separate Dozen and Pieces fields.
- Enter purchase rate.
- Review all lines.
- Post using `Receive & Add to Stock`.
- Posting automatically increases stock.

## Sales

- Create direct invoice without requiring a sales order.
- Choose or create customer.
- Show customer's current outstanding amount.
- Add products by article number.
- Show available stock in Dozen + Pieces and Total Pieces.
- Enter quantity using Dozen and Pieces.
- Enter agreed selling price.
- Review invoice.
- Mark Paid, Partial or Pending.
- Post invoice to decrease stock.

## Payments and WhatsApp

- Receive full or partial customer payment.
- Track invoice and customer outstanding balances.
- Pending/partial invoices expose a WhatsApp Reminder button.
- Version 1 opens WhatsApp/WhatsApp Web with customer number and prefilled reminder; sending remains manual.
- Reminder message contains customer name, invoice number, total, outstanding and due date when available.

## Expenses

Record date, category, amount, account/method, payee, note and optional attachment. Expenses affect reporting but never inventory.

## Controls

Posted transactions are not silently deleted or edited. Correction uses cancellation, reversal or stock adjustment with reason. Every important action records the owner account and timestamp.
