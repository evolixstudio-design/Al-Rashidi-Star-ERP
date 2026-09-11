const pg = require('pg');

const c = new pg.Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Qusai5253',
  database: 'rashidi_erp',
});

async function main() {
  await c.connect();

  const cols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='customers' ORDER BY ordinal_position"
  );
  console.log('CUSTOMERS COLS:', cols.rows.map((x) => x.column_name).join(', '));

  const tables = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('TABLES:', tables.rows.map((x) => x.table_name).join(', '));

  const invCols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='sales_invoices' ORDER BY ordinal_position"
  );
  console.log('SALES_INVOICES COLS:', invCols.rows.map((x) => x.column_name).join(', '));

  await c.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
