const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./garage.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create Jobs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS Jobs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    reg_plate TEXT,
    owner TEXT,
    job_description TEXT,
    comments TEXT,
    parts TEXT,
    price REAL,
    mechanic_id INTEGER
)`);

app.post('/api/login', (req, res) => {
    const { USERNAME, PASSWORD } = req.body;
    console.log('Received login request:', { USERNAME, PASSWORD });
    const query = 'SELECT id, USERNAME, NAME, ROLE FROM Garage WHERE USERNAME = ? AND PASSWORD = ?';
    db.get(query, [USERNAME, PASSWORD], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else if (row) {
            console.log('Login successful for user:', row);
            res.json({ id: row.id, username: row.USERNAME, name: row.NAME, role: row.ROLE });
        } else {
            console.log('Login failed for username:', USERNAME);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.get('/api/jobs', (req, res) => {
    db.all('SELECT * FROM Jobs', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            const jobs = rows.map(row => ({
                id: row.id,
                date: row.date,
                regPlate: row.reg_plate,
                owner: row.owner,
                jobDescription: row.job_description,
                comments: row.comments,
                parts: row.parts,
                price: row.price,
                mechanicId: row.mechanic_id
            }));
            res.json(jobs);
        }
    });
});

app.post('/api/jobs', (req, res) => {
    const jobs = req.body;
    db.run('DELETE FROM Jobs', (err) => {
        if (err) {
            console.error('Error clearing jobs:', err);
            return res.status(500).json({ error: 'Failed to clear jobs' });
        }
        if (jobs.length === 0) {
            return res.json({ message: 'No jobs to save' });
        }
        let insertCount = 0;
        jobs.forEach(job => {
            db.run(`INSERT INTO Jobs (id, date, reg_plate, owner, job_description, comments, parts, price, mechanic_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [job.id, job.date, job.regPlate, job.owner, job.jobDescription, job.comments, job.parts, job.price, job.mechanicId],
                (err) => {
                    if (err) {
                        console.error("INSERT ERROR:", err.message);
                    } else {
                        console.log("Inserted job:", job.id);
                    }
                    insertCount++;
                    if (insertCount === jobs.length) {
                        console.log(`Saved ${insertCount} jobs to database`);
                        res.json({ message: `Saved ${insertCount} jobs` });
                    }
                });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});