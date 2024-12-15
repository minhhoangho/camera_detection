const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Create a server that forwards requests
const server = http.createServer((req, res) => {
    // Forward requests to the target server
    const target = 'http://localhost:8090'; // Change to your target port
    proxy.web(req, res, { target: target }, (error) => {
        console.error('Proxy error:', error);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway');
    });
});

// Start the server on port 8090
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Proxy server is running at http://localhost:${PORT}`);
});