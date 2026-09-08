# Sales and Direct Invoice Workflow

## Default workflow

Customer sale -> New Invoice -> Select/Create Customer -> Add Products -> Review -> Select Payment Status -> Post Invoice -> Print / WhatsApp / Done.

A sales order is optional and secondary. Normal sales must not require an order first.

## Step 1 — Customer

Search existing customer or create a new one. Show customer phone and current outstanding amount immediately.

## Step 2 — Add products

For each line:

- Search by article number first.
- Show product name.
- Show available stock as `X Dozen Y Pcs` and `Z Total Pcs`.
- Enter Dozen and Pieces.
- System calculates total pieces.
- Prefill standard selling price.
- Allow owner to enter agreed selling price.
- Show line total.

## Step 3 — Review invoice

Show all items, total quantity and invoice total before posting.

## Step 4 — Payment status

Use three large choices:

- PAID
- PARTIAL
- PENDING

### Paid

Enter payment method and complete sale.

### Partial

Enter amount received. System calculates outstanding balance.

### Pending

Optional due date and note. Full invoice amount becomes outstanding.

## Posting effects

Posting the invoice:

- Deducts sold quantity from stock.
- Creates stock-ledger movements.
- Creates customer ledger/outstanding amount.
- Records received payment if any.
- Updates sales reports.
- Creates audit entry.

Saving as draft changes no stock.
