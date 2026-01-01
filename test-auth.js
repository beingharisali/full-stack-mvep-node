require('dotenv').config();
const http = require('http');

console.log('Testing health endpoint...');
const healthRequest = http.get('http://localhost:5000/health', (res) => {
    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Health endpoint response:', data);
    });
});

healthRequest.on('error', (err) => {
    console.error('Health endpoint error:', err.message);
});

setTimeout(() => {
    console.log('\nTesting auth route availability...');
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Auth register endpoint status: ${res.statusCode}`);
        res.on('data', (chunk) => {
            console.log('Auth endpoint responded (status code indicates it was received)');
        });
    });

    req.on('error', (err) => {
        console.error('Auth endpoint error:', err.message);
    });

    req.write('{}');
    req.end();
}, 1000);