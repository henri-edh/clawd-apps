# 🚀 Mission Control - Kanban Project Management Dashboard

Badger's autonomous project tracking system. Built to manage development work, research tasks, and strategic initiatives.

## Purpose
Track and organize:
- App builds and development work
- FlightScope sales research
- Competitive intelligence and market analysis
- Strategic initiatives

## Features

### Core Features
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

### Interactive Features (New!)
- ✏️ **Task editing modal** - Edit title, description, priority, tags, column, due date
- 👁️ **Task detail view** - Full task information with subtasks and notes
- 💬 **Notes/comments UI** - Add and view notes per task
- 🔍 **Search & filtering** - Search tasks, filter by priority/column/tags
- 🏷️ **Tag-click filtering** - Click any tag to filter by it
- ⌨️ **Keyboard shortcuts**:
  - `N` - Create new task
  - `Esc` - Close modal
  - `B` - Back to boards
  - `R` - Refresh board
- 📅 **Due dates** - Set due dates on tasks with visual indicators
  - 🔴 Red for overdue
  - 🟡 Yellow for upcoming (≤ 3 days)
- ✨ **Visual drag feedback** - Ghost element while dragging, highlight drop zones
- 📝 **Subtasks/checklists** - Add subtasks within tasks
- 📊 **Progress bars** - Visual progress indicator per task
- ➕ **Add/delete columns** - Dynamically manage board columns
- 📋 **Activity feed** - Per-board activity log showing task movements
- ⚡ **Smooth animations** - CSS transitions for better UX

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

### Basic Workflow
1. Create boards for different projects
2. Add tasks with details, tags, priorities, and due dates
3. Drag tasks between columns
4. Track progress in overview dashboard

### Interactive Features

#### Task Management
- **View task details:** Click on any task title to see full details
- **Edit tasks:** Click the "Edit Task" button in the detail view
- **Delete tasks:** Click the "Delete Task" button in the detail view

#### Search & Filtering
- **Search:** Type in the search box to filter tasks by title, description, or tags
- **Filter by priority:** Use the priority dropdown
- **Filter by column:** Use the column dropdown
- **Filter by tags:** Click on any tag in a task card to filter by that tag
- **Clear filters:** Click the "Clear" button to reset all filters

#### Subtasks
- Open task detail view
- Click "+ Add" next to Subtasks header
- Enter subtask title and click Add
- Click checkbox to mark subtask as complete
- Click × to delete subtask

#### Notes
- Open task detail view
- Type a note in the text area and click "Add Note"
- Click "Delete" on any note to remove it

#### Column Management
- Click the "+" button in a column header to add a new column after it
- Click the "🗑️" button to delete a column (except Backlog)
- Tasks in deleted columns will also be deleted

#### Activity Feed
- Click "📋 Activity" button in board header
- View recent activity for the board (task creation, movements)
- Click "✕" to close the activity panel

#### Keyboard Shortcuts
- `N` - Create new task (when on a board)
- `Esc` - Close any open modal
- `B` - Go back to boards list (when viewing a board)
- `R` - Refresh current view

#### Due Dates
- Add due dates when creating/editing tasks
- 🔴 Red indicator = overdue
- 🟡 Yellow indicator = due in 3 days or less
- No indicator = due date is more than 3 days away or not set

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
- `POST /api/boards/:boardId/columns` - Add a column to a board
- `DELETE /api/boards/:boardId/columns/:columnName` - Delete a column from a board
- `PUT /api/boards/:boardId/columns` - Update board columns (reorder)

### Tasks
- `GET /api/boards/:boardId/tasks` - List tasks for a board
- `POST /api/boards/:boardId/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Subtasks
- `POST /api/tasks/:taskId/subtasks` - Create a subtask
- `PUT /api/subtasks/:subtaskId` - Update a subtask (title, completed)
- `DELETE /api/subtasks/:subtaskId` - Delete a subtask

### Task Notes
- `GET /api/tasks/:taskId/notes` - List notes for a task
- `POST /api/tasks/:taskId/notes` - Add a note to a task
- `DELETE /api/notes/:id` - Delete a note

### Activities
- `GET /api/boards/:boardId/activities` - Get activity log for a board

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
