const http = require('http');
const url = require('url');

const server = http.createServer(
    (req, res) => {
        const parsedURL = url.parse(req.url, true);
        const { pathname, query } = parsedURL;

        res.setHeader('Content-Type', 'application/json');

        if (pathname == '/echo') {
            res.writeHead(200);
            res.end(JSON.stringify(req.headers, null, 2));
            return;
        }

        if (pathname == '/slow') {
            const delay = parseInt(query.ms, 10) || 3000;
            setTimeout(() => {
                res.writeHead(200);
                res.end(JSON.stringify({ message: `Delayed response by ${delay}ms` }));
            }, delay);
            return;
        }

        if (pathname == '/cache') {
            res.setHeader('Cache-Control', 'public, max-age=10');
            res.writeHead(200);
            res.end(JSON.stringify({ "Cache-Header": res.getHeader('Cache-Control') }));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found!' }));
    });

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Starting server at port ${PORT}`);
})