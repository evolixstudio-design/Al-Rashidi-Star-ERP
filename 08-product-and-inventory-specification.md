# Product and Inventory Specification

## Product identity

Supplier article number is the primary unique product identifier.

## Product fields

- Article number
- Product name
- Optional Arabic print description
- Category
- Optional colour
- Optional size
- Purchase price
- Selling price
- Reorder level
- Active/inactive status
- Optional product image

## Quantity model — locked

The system stores stock internally as total pieces for accuracy.

For normal trading display, 1 dozen = 12 pieces.

Every inventory balance must show both formats:

`10 Dozen 5 Pcs`

and

`125 Total Pcs`

## Input model

Transaction quantity uses two clear fields:

- Dozen
- Pieces

The system automatically calculates Total Pieces.

Example: 2 Dozen + 3 Pcs = 27 Total Pcs.

## Current stock screen

Recommended columns:

Article No. | Product | Stock (Dozen + Pcs) | Total Pcs | Selling Price | Low Stock Status

## Stock events

- Opening Balance increases stock.
- Receive Shipment increases stock.
- Posted sales invoice decreases stock.
- Approved-by-confirmation stock adjustment increases/decreases stock with reason.
- Draft invoice changes no stock.

## Stock ledger

Every stock change creates an immutable movement containing date, product, quantity change in total pieces, human-readable dozen/piece equivalent, source document and owner account.
