# API and Integration Contract

## API style

Use authenticated JSON APIs. Both owner accounts have full access, but every write request still identifies the current owner for audit history.

## Main resources

Products, categories, customers, suppliers, stock balances, stock movements, purchase receipts, invoices, customer receipts, supplier payments, expenses, reports, settings, attachments and audit events.

## Required capabilities

- Fast article-number/product search.
- Read current stock in total pieces plus formatted dozen/piece representation.
- Create and post shipment receipt.
- Create draft/post/cancel invoice.
- Record full/partial customer payment.
- Return invoice/customer outstanding balance.
- Generate WhatsApp reminder payload/link from customer phone and pending invoice data.
- Generate print-ready invoice through a dedicated print service.
- Filter and export reports.

## WhatsApp integration — Version 1

Generate a click-to-chat action for WhatsApp/WhatsApp Web with encoded prefilled message. The user manually reviews and sends the message. No paid API or automatic message dispatch is required in Version 1.

## Print boundary

Invoice/PDF generation remains separated from sales and inventory logic so layout changes cannot break stock or accounting behaviour.
