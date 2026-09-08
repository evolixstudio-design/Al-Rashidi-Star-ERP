# Language and Localization Design

## Application language — locked

The daily software interface uses Hinglish: Roman Hindi combined with familiar English business words.

Examples:

- `New Sale / Invoice`
- `Shipment Receive Karein`
- `Payment Pending`
- `Amount Receive Karein`
- `Stock me Add Karein`
- `Invoice Print Karein`

The wording must be short, respectful and easy to understand for 50+ users. Avoid slang and avoid complicated Hindi vocabulary.

## Customer-facing documents

The printed invoice remains English + Arabic according to the Kuwait reference and client-approved wording.

## Data entry

Product/customer/supplier names can be entered in the business's preferred script. Arabic print fields may be stored separately where needed for invoice output.

## Number and money formatting

Money is displayed in K.D. with required decimal precision. Numeric alignment stays consistent and easy to scan.

## Error messages

Use simple Hinglish, for example:

- `Customer select karein.`
- `Stock available nahi hai.`
- `Quantity enter karein.`
- `Payment amount invoice total se zyada nahi ho sakta.`
