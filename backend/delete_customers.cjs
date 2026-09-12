const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is required");
}
const client = new Client({ connectionString });

async function run() {
  await client.connect();
  const res1 = await client.query('DELETE FROM customer_opening_balance_adjustments WHERE "customerId" IN (102, 103) RETURNING id');
  console.log('Deleted Adjustments:', res1.rows);
  const res2 = await client.query('DELETE FROM customers WHERE id IN (102, 103) RETURNING id, name');
  console.log('Deleted Customers:', res2.rows);
  await client.end();
}
run().catch(console.error);
