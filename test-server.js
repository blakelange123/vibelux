const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body>
        <h1>Test Server Working!</h1>
        <p>If you can see this, your system can serve web pages.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <a href="/design/advanced">Go to Design Page</a>
      </body>
    </html>
  `);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});