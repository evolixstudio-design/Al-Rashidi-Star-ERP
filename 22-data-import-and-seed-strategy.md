# Data Import and Seed Strategy

## Initial import

Provide spreadsheet templates for:

- Categories
- Products / article numbers
- Opening stock
- Purchase and selling prices
- Customers and phone numbers
- Suppliers
- Customer opening outstanding
- Supplier opening outstanding

## Product stock fields

Opening quantity may be entered as:

- Opening Dozen
- Opening Pieces

The importer calculates Total Pieces and shows the converted result before final import.

## Validation

Show row-level errors before committing. Article duplicates, invalid quantity, invalid price and missing required references must be clearly reported.

## Opening stock ledger

Every imported opening quantity creates a dated `Opening Balance` stock-ledger entry.

## Training data

Use separate test/demo data for training the two owners. Demo transactions must not enter live reports.
