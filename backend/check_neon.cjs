require('dotenv').config();
const pg = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("NO DATABASE_URL");
    process.exit(1);
  }

  const isSsl = url.includes('neon.tech') || url.includes('sslmode=');
  const c = new pg.Client({
    connectionString: url,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
  });

  await c.connect();

  console.log('=== DATABASE INFO ===');
  const dbName = await c.query('SELECT current_database()');
  console.log('Current DB:', dbName.rows[0].current_database);
  const dbSchema = await c.query('SELECT current_schema()');
  console.log('Current Schema:', dbSchema.rows[0].current_schema);
  
  console.log('\n=== TABLES ===');
  const tables = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log(tables.rows.map(x => x.table_name).join(', '));

  console.log('\n=== CUSTOMERS COLUMNS ===');
  const custCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='customers' ORDER BY ordinal_position");
  console.log(custCols.rows.map(x => x.column_name).join(', '));

  console.log('\n=== SALES INVOICES COLUMNS ===');
  const invCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='sales_invoices' ORDER BY ordinal_position");
  console.log(invCols.rows.map(x => x.column_name).join(', '));

  console.log('\n=== CUSTOMER RECEIPTS COLUMNS ===');
  const recCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='customer_receipts' ORDER BY ordinal_position");
  console.log(recCols.rows.map(x => x.column_name).join(', '));
  
  console.log('\n=== PRODUCTS COLUMNS ===');
  const prodCols = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position");
  console.log(prodCols.rows.map(x => x.column_name).join(', '));

  console.log('\n=== ROW COUNTS ===');
  const counts = ['customers', 'products', 'sales_invoices', 'sales_invoice_lines', 'customer_receipts', 'purchase_receipts', 'expenses', 'audit_events'];
  for (const t of counts) {
    try {
      const res = await c.query(`SELECT count(*) as c FROM ${t}`);
      console.log(`${t}: ${res.rows[0].c}`);
    } catch(e) {
      console.log(`${t}: Error - ${e.message}`);
    }
  }

  await c.end();
}

main().catch(e => { console.error(e); process.exit(1); });
