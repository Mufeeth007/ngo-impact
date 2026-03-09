// Run this with: node test-connection.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/test',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Backend is running and accessible!');
    } else {
      console.log('❌ Backend returned error');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Cannot connect to backend:');
  console.error('Error:', error.message);
  console.error('\nMake sure:');
  console.error('1. Backend server is running (npm run dev in server folder)');
  console.error('2. Port 5000 is not blocked');
  console.error('3. No firewall is blocking the connection');
});

req.end();