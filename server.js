const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

// ── SERVE FRONTEND ──
// This tells Express to serve index.html as a static file.
// Now when your phone visits http://192.168.1.134:3001 it gets the app directly.
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE SETUP ──
const adapter = new FileSync('tasks.json');
const db = low(adapter);
db.defaults({ tasks: [] }).write();

function generateId() {
  return Date.now().toString();
}

// ── ROUTES ──
app.get('/tasks', (req, res) => {
  const tasks = db.get('tasks').value();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title, priority = 'medium', category = 'Work', due = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const task = {
    id: generateId(),
    title, priority, category, due,
    done: false,
    created: new Date().toISOString()
  };

  db.get('tasks').unshift(task).write();
  res.json(task);
});

app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const task = db.get('tasks').find({ id }).value();
  if (!task) return res.status(404).json({ error: 'Task not found' });

  db.get('tasks').find({ id }).assign(updates).write();
  const updated = db.get('tasks').find({ id }).value();
  res.json(updated);
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get('tasks').remove({ id }).write();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('Daylite backend running at http://localhost:' + PORT);
  console.log('On your phone, open: http://192.168.1.134:' + PORT);
  console.log('Tasks stored in: tasks.json');
  console.log('Press Ctrl+C to stop');
});
