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
const BACKUP_DIR = path.join(__dirname, 'database', 'backups');

// Ensure database directory exists
const fs = require('fs');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Ensure backups directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup functions
function getBackupFileName() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `mission-control-${dateStr}-${timeStr}.json`;
}

function createBackup() {
  try {
    const backupPath = path.join(BACKUP_DIR, getBackupFileName());
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`✅ Backup created: ${path.basename(backupPath)}`);

    // Clean old backups (keep last 7 days)
    cleanOldBackups();
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('mission-control-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first

    // Keep last 7 backups
    const filesToDelete = files.slice(7);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Deleted old backup: ${file.name}`);
    });
  } catch (error) {
    console.error('❌ Backup cleanup failed:', error.message);
  }
}

function scheduleDailyBackup() {
  // Backup every day at midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow - now;

  setTimeout(() => {
    createBackup();
    // Schedule every 24 hours
    setInterval(createBackup, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);

  console.log(`⏰ Daily backup scheduled for ${tomorrow.toISOString()}`);
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

// API: Export all data
app.get('/api/export', (req, res) => {
  db.read();
  const exportData = {
    version: '1.0',
    exportedAt: getCurrentTimestamp(),
    data: {
      boards: db.data.boards || [],
      tasks: db.data.tasks || [],
      taskNotes: db.data.taskNotes || []
    }
  };

  const filename = `mission-control-export-${getCurrentTimestamp().replace(/[:.]/g, '-')}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(exportData);
});

// API: Import data
app.post('/api/import', (req, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid import data format' });
    }

    // Create a backup before importing
    createBackup();

    db.read();
    db.data = {
      boards: data.boards || [],
      tasks: data.tasks || [],
      taskNotes: data.taskNotes || []
    };
    db.write();

    console.log(`✅ Data imported: ${db.data.boards.length} boards, ${db.data.tasks.length} tasks`);
    res.json({
      success: true,
      imported: {
        boards: db.data.boards.length,
        tasks: db.data.tasks.length,
        notes: db.data.taskNotes.length
      }
    });
  } catch (error) {
    console.error('❌ Import failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: List backups
app.get('/api/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('mission-control-') && f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ backups: files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Restore from backup
app.post('/api/backups/:filename/restore', (req, res) => {
  try {
    const backupPath = path.join(BACKUP_DIR, req.params.filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    // Create backup of current state before restoring
    createBackup();

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    db.read();
    db.data = {
      boards: backupData.boards || [],
      tasks: backupData.tasks || [],
      taskNotes: backupData.taskNotes || []
    };
    db.write();

    console.log(`✅ Restored from backup: ${req.params.filename}`);
    res.json({
      success: true,
      restored: {
        boards: db.data.boards.length,
        tasks: db.data.tasks.length,
        notes: db.data.taskNotes.length
      }
    });
  } catch (error) {
    console.error('❌ Restore failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mission Control running at http://localhost:${PORT}`);
  console.log(`🦡 Badger at your service`);

  // Schedule daily backups
  scheduleDailyBackup();

  // Create initial backup on startup
  createBackup();
});
