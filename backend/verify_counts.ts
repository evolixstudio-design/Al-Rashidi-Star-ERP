import { Client } from 'pg';

const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_hJCe9Rq0aBGj@ep-odd-rain-b3eddtev.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
});

async function run() {
    await client.connect();
    const tables = [
        'customers', 'products', 'sales_invoices', 'sales_invoice_lines',
        'customer_receipts', 'purchase_receipts', 'expenses', 'audit_events',
        'stock_ledger', 'sales_returns', 'sales_return_lines', 'customer_refunds',
        'customer_receipt_allocations', 'customer_opening_balance_adjustments'
    ];
    for (const table of tables) {
        try {
            const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`${table}: ${res.rows[0].count}`);
        } catch (e: any) {
            console.log(`${table}: ERROR ${e.message}`);
        }
    }
    
    // Check columns
    const cols = await client.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_name IN ('customers', 'sales_invoices', 'products') 
        AND column_name IN (
            'openingBalanceOriginalKd', 'openingOutstandingKd', 'openingBalanceDate', 'openingBalanceNote',
            'totalReturnedKd', 'totalRefundedKd',
            'imageData', 'imageMimeType', 'imageUpdatedAt'
        )
    `);
    console.log('Columns found:', cols.rows);
    
    // Check migrations tracking
    const migrations = await client.query('SELECT version, name, checksum, applied_at FROM schema_migrations');
    console.log('schema_migrations:', migrations.rows);
    await client.end();
}

run().catch(console.error);
