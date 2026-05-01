const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./garage.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    data TEXT
)`);

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (user) {
            res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/api/jobs', (req, res) => {
    const jobs = req.body;
    db.run('DELETE FROM jobs');
    jobs.forEach(job => {
        db.run('INSERT INTO jobs (id, data) VALUES (?, ?)', [job.id, JSON.stringify(job)]);
    });
    res.json({ message: 'Saved' });
});

app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM jobs', [], (err, rows) => {
        const jobs = rows.map(row => JSON.parse(row.data));
        res.json(jobs);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));