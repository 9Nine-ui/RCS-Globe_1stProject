import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

const PORT = 5002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server listening on ${PORT}`);
});
