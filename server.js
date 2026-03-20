const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE SETUP ──
// On Render, the DATABASE_URL environment variable is automatically set
// when you attach a Postgres database to your service.
// pg.Pool manages a pool of connections to the database efficiently.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Create the tasks table if it doesn't exist yet
// This runs every time the server starts — safe to run repeatedly
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        TEXT PRIMARY KEY,
      title     TEXT NOT NULL,
      priority  TEXT DEFAULT 'medium',
      category  TEXT DEFAULT 'Work',
      due       TEXT DEFAULT '',
      done      BOOLEAN DEFAULT false,
      created   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database ready');
}

// ── ROUTES ──

// GET /tasks — return all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks — create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { title, priority = 'medium', category = 'Work', due = '' } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const id = Date.now().toString();
    const result = await pool.query(
      'INSERT INTO tasks (id, title, priority, category, due) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, title, priority, category, due]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id — update a task
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { done, title, priority, category, due } = req.body;

    const current = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const task = current.rows[0];

    const result = await pool.query(
      'UPDATE tasks SET done=$1, title=$2, priority=$3, category=$4, due=$5 WHERE id=$6 RETURNING *',
      [
        done !== undefined ? done : task.done,
        title ?? task.title,
        priority ?? task.priority,
        category ?? task.category,
        due ?? task.due,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id — remove a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START ──
initDB().then(() => {
  app.listen(PORT, () => {
    console.log('Daylite backend running on port ' + PORT);
  });
});
