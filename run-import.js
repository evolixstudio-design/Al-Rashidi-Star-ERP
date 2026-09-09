const fs = require('fs');
const http = require('http');

async function doImport() {
  const fileData = fs.readFileSync('import_data_2.json', 'utf8');
  
  console.log('Logging in...');
  const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'evolixstudio@gmail.com', password: 'Qusai5253' })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    return;
  }
  
  const { accessToken } = await loginRes.json();
  console.log('Login successful. Starting import...');
  
  // Use http.request to bypass fetch timeout limitations easily
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/backup/restore-json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Length': Buffer.byteLength(fileData)
    },
    timeout: 300000 // 5 minutes
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Import finished with status:', res.statusCode);
      console.log('Response:', data);
    });
  });
  
  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });
  
  req.on('timeout', () => {
    console.error('Request timed out!');
    req.destroy();
  });
  
  req.write(fileData);
  req.end();
}

doImport().catch(console.error);
