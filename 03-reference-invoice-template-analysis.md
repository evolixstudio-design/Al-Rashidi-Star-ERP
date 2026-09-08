# Reference Invoice Template Analysis

## Purpose

The supplied invoice reference defines the customer-facing printed invoice structure. The application UI is Hinglish, but the printed invoice remains English + Arabic for business use in Kuwait.

## Layout elements to preserve

- Company identity and contact block.
- Invoice number and date.
- Customer name/details.
- Item table with serial number, description, quantity, unit price and amount.
- K.D. / fils formatting where required.
- Total amount.
- Terms and conditions.
- Owner/sales signature and customer signature areas if required by the approved sample.

## Quantity display

Invoice line quantity should support a human-readable format such as `2 Dozen 3 Pcs` and may also show `27 Pcs` where space allows.

## Payment display

Invoice or receipt output may show payment status: Paid, Partial or Pending, plus received and outstanding amount where required.

## Configuration

Logo, company English name, company Arabic name, address, phone, invoice terms, numbering and print colours are configurable.

## Approval gate

The final invoice is not considered exact until compared with the client's actual reference invoice and approved using real sample data.
