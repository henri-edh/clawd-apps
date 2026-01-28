# 🚀 Mission Control - Kanban Project Management Dashboard

Badger's autonomous project tracking system. Built to manage development work, research tasks, and strategic initiatives.

## Purpose
Track and organize:
- App builds and development work
- FlightScope sales research
- Competitive intelligence and market analysis
- Strategic initiatives

## Features
- 📋 Kanban-style boards with drag-and-drop
- 🎯 Customizable columns (Backlog, In Progress, Review, Done)
- 📊 Overview dashboard with metrics
- 🔄 Real-time updates
- 📝 Task details and notes
- 🏷️ Tags and priorities
- 💾 **Automatic daily backups** (keeps last 7 days)
- 📤 **Export data** to JSON file
- 📥 **Import data** from JSON file
- 🗂️ **Restore from backups**

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js with Express
- **Storage:** LowDB (JSON-based, no native dependencies)
- **UI:** Clean, modern, Trello-inspired

## Project Structure
```
mission-control/
├── server.js          # Express backend with LowDB
├── database/
│   ├── mission-control.json    # Main database (not in Git)
│   └── backups/                # Automatic backups (not in Git)
├── public/
│   ├── index.html     # Main dashboard
│   ├── styles.css     # Modern UI styling
│   └── app.js         # Frontend logic
├── api/               # API endpoints
└── tasks/             # Task management
```

## Getting Started
```bash
cd mission-control
npm install
node server.js
# Open http://localhost:3000
```

## Usage
1. Create boards for different projects
2. Add tasks with details, tags, priorities
3. Drag tasks between columns
4. Track progress in overview dashboard

## Backup & Restore

### Automatic Backups
- Backups are created automatically every day at midnight
- Last 7 backups are retained
- Backups stored in `database/backups/`
- A backup is also created on server startup

### Manual Export
- Click "💾 Export" in the sidebar
- Downloads a JSON file with all boards, tasks, and notes
- Use for offsite backups or sharing data

### Import Data
- Click "📥 Import" in the sidebar
- Select a previously exported JSON file
- **Warning:** Import replaces all current data
- A backup is automatically created before importing

### Restore from Backup
- Click "🗂️ Backups" in the sidebar
- View all available backups with timestamps
- Click "Restore" on any backup to recover data
- A backup is created before restoring

## API Endpoints

### Boards
- `GET /api/boards` - List all boards
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board

### Tasks
- `GET /api/boards/:boardId/tasks` - List tasks for a board
- `POST /api/boards/:boardId/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Export / Import / Backups
- `GET /api/export` - Export all data as JSON
- `POST /api/import` - Import data from JSON
- `GET /api/backups` - List available backups
- `POST /api/backups/:filename/restore` - Restore from a backup

### Stats
- `GET /api/stats` - Dashboard statistics

## Status
✅ **Live** - Running at http://localhost:3000

---

*Built autonomously by Badger 🦡*
