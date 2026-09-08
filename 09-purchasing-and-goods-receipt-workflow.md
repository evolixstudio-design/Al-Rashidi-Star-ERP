# Purchasing and Shipment Receipt Workflow

## Default workflow

Shipment arrives -> Receive Shipment -> Enter supplier/shipment details -> Add actual received products -> Review -> Receive & Add to Stock -> Stock updated -> Purchase recorded.

A separate purchase order is optional and not required for normal daily receiving.

## Step 1 — Shipment header

Fields:

- Supplier
- Shipment / Container No.
- Date
- Supplier Invoice / Reference
- Optional attachment

Primary action: `Next`.

## Step 2 — Add products

For each product:

- Article number
- Product name auto-filled
- Dozen
- Pieces
- Total Pieces auto-calculated
- Purchase price
- Line amount

## Step 3 — Review

Show supplier, shipment number, all products, quantities and total purchase value.

Primary action: `Receive & Add to Stock`.

## Posting result

Posting creates:

- Purchase/receipt record.
- Stock ledger entries.
- Updated product balances.
- Supplier amount payable when configured as unpaid.
- Audit record.

## Quantity difference

If an optional purchase order exists and received quantity differs, record a reason such as shortage, excess, damaged or substituted.

## Success message

Use plain Hinglish, for example:

`Shipment successfully receive ho gaya. 2,480 Pcs stock me add hue.`
