# Daylite Backend

A simple Node.js + Express backend for the Daylite task manager.

## What's inside

| File | What it does |
|------|-------------|
| `server.js` | The traffic controller — defines all the routes |
| `database.js` | All database logic — reads/writes to tasks.db |
| `tasks.db` | Auto-created on first run — your actual data lives here |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# For development (auto-restarts on file changes)
npm run dev
```

Server runs at: `http://localhost:3000`

## API Routes

| Method | URL | What it does |
|--------|-----|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get one task |
| POST | /tasks | Create a task |
| PATCH | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| GET | /health | Check server is running |

## Example requests

```bash
# Get all tasks
curl http://localhost:3000/tasks

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","priority":"high","category":"Personal"}'

# Mark task #1 as done
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'

# Delete task #1
curl -X DELETE http://localhost:3000/tasks/1
```
