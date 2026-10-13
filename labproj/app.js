const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const db = mysql.createPool({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'labproj' });
const sessions = new Map();
const users = { jay: ['1234', 'admin'], student: ['1234', 'user'] };

const json = (res, status, data = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(status === 204 ? '' : JSON.stringify(data));
};
const body = req => new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(Error('Invalid JSON')); } });
    req.on('error', reject);
});
const user = req => sessions.get((req.headers.authorization || '').replace('Bearer ', ''));
const auth = (req, res, role) => {
    const current = user(req);
    if (!current) { json(res, 401, { message: 'Authentication required' }); return null; }
    if (role && current.role !== role) { json(res, 403, { message: 'Access denied' }); return null; }
    return current;
};

async function initialize() {
    const connection = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: '' });
    await connection.query('CREATE DATABASE IF NOT EXISTS labproj');
    await connection.end();
    await db.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR( fifty ) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, role ENUM('admin','user') NOT NULL
    )`.replace('fifty', '50'));
    await db.query(`CREATE TABLE IF NOT EXISTS movies (
        id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, rating TINYINT NOT NULL,
        lat DECIMAL(10,7) NULL, lng DECIMAL(10,7) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    for (const [username, [password, role]] of Object.entries(users)) {
        await db.query('INSERT IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role]);
    }
}

const server = http.createServer(async (req, res) => {
    try {
        if (req.url === '/api/login' && req.method === 'POST') {
            const { username, password } = await body(req);
            const [rows] = await db.query('SELECT username, role FROM users WHERE username = ? AND password = ?', [username, password]);
            if (!rows[0]) return json(res, 401, { message: 'Authentication failed' });
            const token = crypto.randomUUID(), loggedIn = rows[0];
            sessions.set(token, loggedIn);
            return json(res, 200, { token, user: loggedIn });
        }
        if (req.url === '/api/me' && req.method === 'GET') {
            const loggedIn = auth(req, res);
            return loggedIn && json(res, 200, { user: loggedIn });
        }
        if (req.url === '/api/logout' && req.method === 'POST') {
            sessions.delete((req.headers.authorization || '').replace('Bearer ', ''));
            return json(res, 204, {});
        }
        if (req.url === '/api/movies' && req.method === 'GET') {
            if (!auth(req, res)) return;
            const [movies] = await db.query('SELECT id, title, rating, lat, lng, created_at AS createdAt FROM movies ORDER BY created_at DESC');
            return json(res, 200, movies);
        }
        if (req.url === '/api/movies' && req.method === 'POST') {
            if (!auth(req, res)) return;
            const movie = await body(req);
            const [result] = await db.query('INSERT INTO movies (title, rating, lat, lng) VALUES (?, ?, ?, ?)', [movie.title, movie.rating, movie.lat, movie.lng]);
            return json(res, 201, { id: result.insertId, ...movie });
        }
        if (req.url.startsWith('/api/movies/') && req.method === 'DELETE') {
            if (!auth(req, res, 'admin')) return;
            await db.query('DELETE FROM movies WHERE id = ?', [req.url.split('/').pop()]);
            return json(res, 200, { message: 'Movie deleted' });
        }
        if (req.url === '/api/movies/import' && req.method === 'POST') {
            if (!auth(req, res, 'admin')) return;
            const movies = await body(req);
            for (const movie of movies) await db.query('INSERT INTO movies (title, rating, lat, lng) VALUES (?, ?, ?, ?)', [movie.title, movie.rating || 0, movie.lat || null, movie.lng || null]);
            return json(res, 201, { message: 'Movies imported' });
        }
        if (req.url.startsWith('/api/')) return json(res, 404, { message: 'API route not found' });
        if (req.method !== 'GET') return json(res, 405, { message: 'Method not allowed' });
        const file = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
        fs.readFile(file, (error, content) => {
            if (error) return json(res, 404, { message: 'Not found' });
            const types = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'text/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8'
            };
            res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
            res.end(content);
        });
    } catch (error) {
        console.error(error.message);
        json(res, 500, { message: 'Server error' });
    }
});

server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
        console.error('Port 3000 is already in use. Open http://localhost:3000 or stop the existing Node process first.');
        process.exitCode = 1;
        return;
    }
    console.error('Server error:', error.message);
});

initialize().then(() => server.listen(3000, () => console.log('Movie Logger: http://localhost:3000')))
    .catch(error => {
        console.error('Database startup failed:', error.message);
        process.exitCode = 1;
    });
