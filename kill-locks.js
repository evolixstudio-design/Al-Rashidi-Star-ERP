const { Client } = require('./backend/node_modules/pg');

async function killConnections() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'Qusai5253',
    database: 'postgres',
  });

  await client.connect();
  const res = await client.query(`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = 'rashidi_erp'
      AND pid <> pg_backend_pid();
  `);
  console.log(`Terminated ${res.rowCount} connections.`);
  await client.end();
}

killConnections().catch(console.error);
