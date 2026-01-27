#!/usr/bin/env node
/**
 * Mission Control - Kanban Dashboard Server
 * Built by Badger 🦡
 * Using LowDB for JSON-based storage (no native dependencies)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database', 'mission-control.json');

// Ensure database directory exists
const fs = require('fs');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize LowDB
const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter, {
  boards: [],
  tasks: [],
  taskNotes: []
});

// Initialize database with default data
db.read();
db.data = db.data || {
  boards: [],
  tasks: [],
  taskNotes: []
};
db.write();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// API: Boards
app.get('/api/boards', (req, res) => {
  db.read();
  res.json(db.data.boards || []);
});

app.post('/api/boards', (req, res) => {
  db.read();
  const { name, description, columns } = req.body;

  const board = {
    id: generateId(),
    name,
    description: description || '',
    columns: columns || ['Backlog', 'In Progress', 'Review', 'Done'],
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };

  db.data.boards.push(board);
  db.write();
  res.json({ id: board.id });
});

app.put('/api/boards/:id', (req, res) => {
  db.read();
  const { name, description, columns } = req.body;

  const board = db.data.boards.find(b => b.id === req.params.id);
  if (board) {
    board.name = name;
    board.description = description || '';
    if (columns) board.columns = columns;
    board.updatedAt = getCurrentTimestamp();
    db.write();
  }
  res.json({ success: true });
});

app.delete('/api/boards/:id', (req, res) => {
  db.read();
  db.data.boards = db.data.boards.filter(b => b.id !== req.params.id);
  db.data.tasks = db.data.tasks.filter(t => t.boardId !== req.params.id);
  db.write();
  res.json({ success: true });
});

// API: Tasks
app.get('/api/boards/:boardId/tasks', (req, res) => {
  db.read();
  const tasks = (db.data.tasks || []).filter(t => t.boardId === req.params.boardId)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  res.json(tasks);
});

app.post('/api/boards/:boardId/tasks', (req, res) => {
  db.read();
  const { title, description, column, priority, tags, position } = req.body;

  const boardTasks = (db.data.tasks || []).filter(t => t.boardId === req.params.boardId);
  const maxPos = Math.max(0, ...boardTasks.map(t => t.position || 0));
  const newPos = position !== undefined ? position : maxPos + 1;

  const task = {
    id: generateId(),
    boardId: req.params.boardId,
    title,
    description: description || '',
    column: column || 'Backlog',
    priority: priority || 'medium',
    tags: tags || [],
    position: newPos,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };

  db.data.tasks.push(task);
  db.write();
  res.json({ id: task.id });
});

app.put('/api/tasks/:id', (req, res) => {
  db.read();
  const { title, description, column, priority, tags, position } = req.body;

  const task = db.data.tasks.find(t => t.id === req.params.id);
  if (task) {
    task.title = title;
    task.description = description || '';
    task.column = column;
    task.priority = priority || 'medium';
    task.tags = tags || [];
    if (position !== undefined) task.position = position;
    task.updatedAt = getCurrentTimestamp();
    db.write();
  }
  res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.read();
  db.data.tasks = db.data.tasks.filter(t => t.id !== req.params.id);
  db.data.taskNotes = db.data.taskNotes.filter(n => n.taskId !== req.params.id);
  db.write();
  res.json({ success: true });
});

// API: Task Notes
app.get('/api/tasks/:taskId/notes', (req, res) => {
  db.read();
  const notes = (db.data.taskNotes || []).filter(n => n.taskId === req.params.taskId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notes);
});

app.post('/api/tasks/:taskId/notes', (req, res) => {
  db.read();
  const { note } = req.body;

  const noteObj = {
    id: generateId(),
    taskId: req.params.taskId,
    note,
    createdAt: getCurrentTimestamp()
  };

  db.data.taskNotes.push(noteObj);
  db.write();
  res.json({ id: noteObj.id });
});

app.delete('/api/notes/:id', (req, res) => {
  db.read();
  db.data.taskNotes = db.data.taskNotes.filter(n => n.id !== req.params.id);
  db.write();
  res.json({ success: true });
});

// API: Dashboard stats
app.get('/api/stats', (req, res) => {
  db.read();

  const boards = db.data.boards || [];
  const tasks = db.data.tasks || [];

  const totalBoards = boards.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.column === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.column === 'In Progress').length;
  const backlogTasks = tasks.filter(t => t.column === 'Backlog').length;

  // Tasks by priority
  const priorityStats = {};
  tasks.forEach(task => {
    const priority = task.priority || 'medium';
    priorityStats[priority] = (priorityStats[priority] || 0) + 1;
  });

  const priorityStatsArray = Object.entries(priorityStats).map(([priority, count]) => ({
    priority,
    count
  }));

  // Recent activity
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  res.json({
    totalBoards,
    totalTasks,
    completedTasks,
    inProgressTasks,
    backlogTasks,
    priorityStats: priorityStatsArray,
    recentTasks
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mission Control running at http://localhost:${PORT}`);
  console.log(`🦡 Badger at your service`);
});
