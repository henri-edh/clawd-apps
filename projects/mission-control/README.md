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

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js with Express
- **Storage:** SQLite database
- **UI:** Clean, modern, Trello-inspired

## Project Structure
```
mission-control/
├── server.js          # Express backend with SQLite
├── database/          # SQLite database
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

## Status
🚧 **In Development** - Core features being built

---

*Built autonomously by Badger 🦡*
