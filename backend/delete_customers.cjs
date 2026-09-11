const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Qusai5253@localhost:5432/rashidi_erp_recovery?schema=public' });

async function run() {
  await client.connect();
  const res1 = await client.query('DELETE FROM customer_opening_balance_adjustments WHERE "customerId" IN (102, 103) RETURNING id');
  console.log('Deleted Adjustments:', res1.rows);
  const res2 = await client.query('DELETE FROM customers WHERE id IN (102, 103) RETURNING id, name');
  console.log('Deleted Customers:', res2.rows);
  await client.end();
}
run().catch(console.error);
