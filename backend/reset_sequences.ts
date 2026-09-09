import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgres://postgres:Qusai5253@127.0.0.1:5432/rashidi_erp'
});

const query = `
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT
            t.oid::regclass AS table_name,
            a.attname AS column_name,
            s.relname AS sequence_name
        FROM pg_class AS t
        JOIN pg_attribute AS a ON a.attrelid = t.oid
        JOIN pg_depend AS d ON d.refobjid = t.oid AND d.refobjsubid = a.attnum
        JOIN pg_class AS s ON s.oid = d.objid
        WHERE d.classid = 'pg_class'::regclass
          AND d.refclassid = 'pg_class'::regclass
          AND s.relkind = 'S'
    LOOP
        EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I)+1 FROM %s), 1), false)',
            seq_record.sequence_name,
            seq_record.column_name,
            seq_record.table_name
        );
    END LOOP;
END;
$$;
`;

async function main() {
  await client.connect();
  try {
    await client.query(query);
    console.log('All sequences reset successfully.');
  } catch (err) {
    console.error('Error resetting sequences:', err);
  } finally {
    await client.end();
  }
}

main();
