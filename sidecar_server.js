const http = require('http');
const port = process.env.PORT || 8080;
const serviceName = process.env.SERVICE_NAME || 'Sidecar';

const server = http.createServer((req, res) => {
  if (req.url === '/api/health' || req.url === '/-/ready' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'UP',
      service: serviceName,
      port: port,
      sharia_aligned: true,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`${serviceName} listening on port ${port}`);
});
