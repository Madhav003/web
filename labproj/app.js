const http = require('http');
const fs = require('fs');
const path = require('path');

const users = [
    { username: 'jay', password: '1234', role: 'admin' },
    { username: 'student', password: '1234', role: 'user' }
];

function reply(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    const username = req.headers.username;
    const password = req.headers.password;
    const user = users.find(u => u.username === username && u.password === password);

    if (req.url === '/api/login') {
        if (!user) return reply(res, 401, { message: 'Authentication failed' });
        return reply(res, 200, { message: 'Login successful', user: username, role: user.role });
    }

    if (req.url === '/admin') {
        if (!user) return reply(res, 401, { message: 'Authentication failed' });
        if (user.role !== 'admin') return reply(res, 403, { message: 'Access denied. Admin only.' });
        return reply(res, 200, { message: 'Welcome Admin!', user: username });
    }

    if (req.method !== 'GET') return reply(res, 405, { message: 'Method not allowed' });

    const file = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    fs.readFile(file, (error, content) => {
        if (error) return reply(res, 404, { message: 'Not found' });
        const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
        res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` });
        res.end(content);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
