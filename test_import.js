const http = require('http');
const fs = require('fs');

async function doRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const loginData = JSON.stringify({ username: 'evolixstudio@gmail.com', password: 'Qusai5253' });
    const loginRes = await doRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    if (loginRes.statusCode !== 201 && loginRes.statusCode !== 200) {
      console.error('Login failed:', loginRes.body);
      return;
    }

    const token = JSON.parse(loginRes.body).access_token;
    console.log('Got token!');

    const payloadStr = fs.readFileSync('C:\\Rashidi traders kuwait\\import_data.json', 'utf8');
    
    console.log('Uploading JSON...');
    const restoreRes = await doRequest({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/backup/restore-json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(payloadStr)
      }
    }, payloadStr);

    console.log('Restore response:', restoreRes.statusCode, restoreRes.body);

  } catch (err) {
    console.error('Script Error:', err);
  }
}

run();
