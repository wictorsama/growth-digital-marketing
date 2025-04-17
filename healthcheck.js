const http = require('http');

http.get('http://localhost:3000/health', (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.error('Health check failed');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('Health check error:', err);
  process.exit(1);
});