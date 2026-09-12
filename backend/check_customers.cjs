const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is required");
}
const client = new Client({ connectionString });

async function run() {
  await client.connect();
  const res = await client.query(`SELECT id, name, phone, "totalOutstanding" FROM customers WHERE name IN ('Qusai Haider', 'saifuddin')`);
  console.log("CUSTOMERS:", res.rows);
  
  for (const c of res.rows) {
    const invoices = await client.query(`SELECT count(*) FROM sales_invoices WHERE "customerId" = $1`, [c.id]);
    const receipts = await client.query(`SELECT count(*) FROM customer_receipts WHERE "customerId" = $1`, [c.id]);
    const opening = await client.query(`SELECT count(*) FROM customer_opening_balance_adjustments WHERE "customerId" = $1`, [c.id]);
    const returns = await client.query(`SELECT count(*) FROM sales_returns WHERE "customerId" = $1`, [c.id]);
    const refunds = await client.query(`SELECT count(*) FROM customer_refunds WHERE "customerId" = $1`, [c.id]);
    console.log(`\nCustomer ${c.id} (${c.name}):`);
    console.log(`  Invoices: ${invoices.rows[0].count}`);
    console.log(`  Receipts: ${receipts.rows[0].count}`);
    console.log(`  Opening Balance Adj: ${opening.rows[0].count}`);
    console.log(`  Returns: ${returns.rows[0].count}`);
    console.log(`  Refunds: ${refunds.rows[0].count}`);
  }
  await client.end();
}
run().catch(console.error);
