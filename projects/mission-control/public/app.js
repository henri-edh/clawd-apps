/**
 * Mission Control - Frontend Application
 * Handles UI interactions, API calls, drag-and-drop, and all interactive features
 */

const API_BASE = '/api';
let currentBoard = null;
let currentView = 'dashboard';
let currentTask = null;
let activeFilters = {
  search: '',
  priority: '',
  column: '',
  tags: []
};
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 20;

// DOM Elements
const elements = {
  navItems: document.querySelectorAll('.nav-item'),
  views: document.querySelectorAll('.view'),
  dashboardView: document.getElementById('dashboard-view'),
  boardsView: document.getElementById('boards-view'),
  boardDetailView: document.getElementById('board-detail-view'),
  lastUpdated: document.getElementById('last-updated'),
  statBoards: document.getElementById('stat-boards'),
  statTasks: document.getElementById('stat-tasks'),
  statProgress: document.getElementById('stat-progress'),
  statDone: document.getElementById('stat-done'),
  priorityStats: document.getElementById('priority-stats'),
  recentTasks: document.getElementById('recent-tasks'),
  boardsList: document.getElementById('boards-list'),
  boardTitle: document.getElementById('board-title'),
  kanbanBoard: document.getElementById('kanban-board'),
  createBoardBtn: document.getElementById('create-board-btn'),
  addTaskBtn: document.getElementById('add-task-btn'),
  backToBoardsBtn: document.getElementById('back-to-boards'),
  modalOverlay: document.getElementById('modal-overlay'),
  createBoardModal: document.getElementById('create-board-modal'),
  addTaskModal: document.getElementById('add-task-modal'),
  editTaskModal: document.getElementById('edit-task-modal'),
  taskDetailModal: document.getElementById('task-detail-modal'),
  boardSettingsModal: document.getElementById('board-settings-modal'),
  addColumnModal: document.getElementById('add-column-modal'),
  createBoardForm: document.getElementById('create-board-form'),
  addTaskForm: document.getElementById('add-task-form'),
  editTaskForm: document.getElementById('edit-task-form'),
  boardSettingsForm: document.getElementById('board-settings-form'),
  addColumnForm: document.getElementById('add-column-form'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  backupsBtn: document.getElementById('backups-btn'),
  importModal: document.getElementById('import-modal'),
  backupsModal: document.getElementById('backups-modal'),
  importForm: document.getElementById('import-form'),
  backupsList: document.getElementById('backups-list'),
  // Search and filters
  taskSearch: document.getElementById('task-search'),
  filterPriority: document.getElementById('filter-priority'),
  filterColumn: document.getElementById('filter-column'),
  clearFilters: document.getElementById('clear-filters'),
  activeTags: document.getElementById('active-tags'),
  // Activity panel
  activityToggleBtn: document.getElementById('activity-toggle-btn'),
  activityPanel: document.getElementById('activity-panel'),
  closeActivityBtn: document.getElementById('close-activity'),
  activityList: document.getElementById('activity-list'),
  // Task detail elements
  taskDetailTitle: document.getElementById('task-detail-title'),
  taskDetailPriority: document.getElementById('task-detail-priority'),
  taskDetailColumn: document.getElementById('task-detail-column'),
  taskDetailDuedate: document.getElementById('task-detail-duedate'),
  taskDetailTags: document.getElementById('task-detail-tags'),
  taskDetailDesc: document.getElementById('task-detail-desc'),
  taskDetailCreated: document.getElementById('task-detail-created'),
  taskDetailUpdated: document.getElementById('task-detail-updated'),
  editCurrentTaskBtn: document.getElementById('edit-current-task-btn'),
  deleteCurrentTaskBtn: document.getElementById('delete-current-task-btn'),
  subtasksList: document.getElementById('subtasks-list'),
  addSubtaskBtn: document.getElementById('add-subtask-btn'),
  addSubtaskForm: document.getElementById('add-subtask-form'),
  newSubtaskInput: document.getElementById('new-subtask-input'),
  cancelSubtaskBtn: document.getElementById('cancel-subtask-btn'),
  taskNotesList: document.getElementById('task-notes-list'),
  addNoteForm: document.getElementById('add-note-form'),
  newNoteInput: document.getElementById('new-note-input'),
  // Board settings
  settingsBoardName: document.getElementById('settings-board-name'),
  settingsColumnsList: document.getElementById('settings-columns-list'),
  settingsWipList: document.getElementById('settings-wip-list'),
  addColumnBtn: document.getElementById('add-column-btn'),
  newColumnName: document.getElementById('new-column-name'),
  newColumnPosition: document.getElementById('new-column-position'),
  newColumnWip: document.getElementById('new-column-wip')
};

// ============================================
// Navigation
// ============================================

elements.navItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    switchView(view);
  });
});

function switchView(view) {
  currentView = view;

  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  elements.views.forEach(v => {
    v.classList.toggle('active', v.id === `${view}-view`);
  });

  if (view === 'dashboard') {
    loadDashboard();
  } else if (view === 'boards') {
    loadBoards();
  }
}

// ============================================
// Keyboard Shortcuts
// ============================================

document.addEventListener('keydown', (e) => {
  // Don't trigger shortcuts when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    if (e.key === 'Escape') {
      closeAllModals();
    }
    return;
  }

  switch(e.key.toUpperCase()) {
    case 'N':
      if (currentBoard) openAddTaskModal();
      break;
    case 'B':
      if (currentBoard) switchView('boards');
      break;
    case 'R':
      if (currentBoard) openBoard(currentBoard.id);
      else if (currentView === 'dashboard') loadDashboard();
      else if (currentView === 'boards') loadBoards();
      break;
    case 'ESCAPE':
      closeAllModals();
      break;
  }
});

// ============================================
// API Functions
// ============================================

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// ============================================
// Dashboard
// ============================================

async function loadDashboard() {
  try {
    const stats = await fetchAPI('/stats');

    elements.statBoards.textContent = stats.totalBoards;
    elements.statTasks.textContent = stats.totalTasks;
    elements.statProgress.textContent = stats.inProgressTasks;
    elements.statDone.textContent = stats.completedTasks;

    // Priority stats
    elements.priorityStats.innerHTML = stats.priorityStats.map(stat => `
      <div class="priority-item">
        <div class="priority-badge ${stat.priority}"></div>
        <div>
          <strong>${stat.priority.charAt(0).toUpperCase() + stat.priority.slice(1)}</strong>
          <span style="margin-left: 8px; color: var(--text-secondary);">${stat.count} tasks</span>
        </div>
      </div>
    `).join('');

    // Recent tasks
    elements.recentTasks.innerHTML = stats.recentTasks.map(task => `
      <div class="recent-task">
        <div class="recent-task-title">${task.title}</div>
        <div class="recent-task-meta">
          ${task.column} • ${new Date(task.updatedAt).toLocaleDateString()}
        </div>
      </div>
    `).join('');

    elements.lastUpdated.textContent = new Date().toLocaleString();
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

// ============================================
// Boards
// ============================================

async function loadBoards() {
  try {
    const boards = await fetchAPI('/boards');

    elements.boardsList.innerHTML = boards.map(board => `
      <div class="board-card" onclick="openBoard(${board.id})">
        <h3>${board.name}</h3>
        <p>${board.description || 'No description'}</p>
        <div class="board-stats">
          <span>📋 ${board.columns.length} columns</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load boards:', err);
  }
}

// ============================================
// Open Board
// ============================================

async function openBoard(boardId) {
  try {
    const boards = await fetchAPI('/boards');
    currentBoard = boards.find(b => b.id === boardId);

    if (!currentBoard) return;

    elements.boardTitle.textContent = currentBoard.name;

    // Populate column filter
    elements.filterColumn.innerHTML = `<option value="">All Columns</option>` +
      (currentBoard.columns || []).map(col => `<option value="${col}">${col}</option>`).join('');

    const tasks = await fetchAPI(`/boards/${boardId}/tasks`);
    renderKanbanBoard(tasks);
    loadActivities();

    elements.views.forEach(v => v.classList.remove('active'));
    elements.boardDetailView.classList.add('active');
    elements.navItems.forEach(i => i.classList.remove('active'));
  } catch (err) {
    console.error('Failed to open board:', err);
  }
}

// ============================================
// Filtering
// ============================================

function filterTasks(tasks) {
  return tasks.filter(task => {
    // Search filter
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description && task.description.toLowerCase().includes(searchLower);
      const tagMatch = task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!titleMatch && !descMatch && !tagMatch) return false;
    }

    // Priority filter
    if (activeFilters.priority && task.priority !== activeFilters.priority) {
      return false;
    }

    // Column filter
    if (activeFilters.column && task.column !== activeFilters.column) {
      return false;
    }

    // Tag filter
    if (activeFilters.tags.length > 0) {
      const taskTags = task.tags || [];
      if (!activeFilters.tags.every(tag => taskTags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

function updateActiveTagsDisplay() {
  if (activeFilters.tags.length === 0) {
    elements.activeTags.innerHTML = '';
    return;
  }

  elements.activeTags.innerHTML = activeFilters.tags.map(tag => `
    <div class="active-tag-filter" onclick="removeTagFilter('${tag}')">
      ${tag}
      <span class="remove-tag">&times;</span>
    </div>
  `).join('');
}

window.removeTagFilter = function(tag) {
  activeFilters.tags = activeFilters.tags.filter(t => t !== tag);
  updateActiveTagsDisplay();
  if (currentBoard) openBoard(currentBoard.id);
};

elements.taskSearch.addEventListener('input', (e) => {
  activeFilters.search = e.target.value;
  if (currentBoard) openBoard(currentBoard.id);
});

elements.filterPriority.addEventListener('change', (e) => {
  activeFilters.priority = e.target.value;
  if (currentBoard) openBoard(currentBoard.id);
});

elements.filterColumn.addEventListener('change', (e) => {
  activeFilters.column = e.target.value;
  if (currentBoard) openBoard(currentBoard.id);
});

elements.clearFilters.addEventListener('click', () => {
  activeFilters = { search: '', priority: '', column: '', tags: [] };
  elements.taskSearch.value = '';
  elements.filterPriority.value = '';
  elements.filterColumn.value = '';
  updateActiveTagsDisplay();
  if (currentBoard) openBoard(currentBoard.id);
});

// ============================================
// Render Kanban Board
// ============================================

function renderKanbanBoard(tasks) {
  const columns = currentBoard.columns || ['Backlog', 'In Progress', 'Review', 'Done'];
  const filteredTasks = filterTasks(tasks);

  elements.kanbanBoard.innerHTML = columns.map(column => {
    const columnTasks = filteredTasks.filter(t => t.column === column);
    return `
      <div class="kanban-column" data-column="${column}">
        <div class="kanban-column-header">
          <div class="column-header-content">
            <h4>${column}</h4>
            <span class="task-count">${columnTasks.length}</span>
          </div>
          <div class="column-actions">
            <button onclick="openAddColumnModal('${column}')" title="Add column after">+</button>
            ${column !== 'Backlog' ? `<button onclick="deleteColumn('${column}')" title="Delete column">🗑️</button>` : ''}
          </div>
        </div>
        <div class="kanban-tasks" data-column="${column}">
          ${columnTasks.map(task => renderTaskCard(task)).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Enable drag-and-drop
  enableDragAndDrop();
}

// ============================================
// Render Task Card
// ============================================

function renderTaskCard(task) {
  const tags = Array.isArray(task.tags) ? task.tags : [];
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const dueDateHtml = task.dueDate ? renderDueDate(task.dueDate) : '';
  const progressHtml = subtasks.length > 0 ? `
    <div class="subtasks-progress">
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      <span>${completedSubtasks}/${subtasks.length}</span>
    </div>
  ` : '';

  return `
    <div class="task-card" draggable="true" data-task-id="${task.id}">
      <div class="task-card-header">
        <div class="task-title" onclick="openTaskDetail('${task.id}')">${task.title}</div>
        <span class="task-priority ${task.priority || 'medium'}">${task.priority || 'medium'}</span>
      </div>
      ${task.description ? `<p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0;">${task.description.substring(0, 80)}...</p>` : ''}
      ${tags.length > 0 ? `
        <div class="task-tags">
          ${tags.map(tag => `<span class="task-tag" onclick="event.stopPropagation(); addTagFilter('${tag}')">${tag}</span>`).join('')}
        </div>
      ` : ''}
      <div class="task-card-meta">
        ${dueDateHtml}
        ${progressHtml}
      </div>
    </div>
  `;
}

window.addTagFilter = function(tag) {
  if (!activeFilters.tags.includes(tag)) {
    activeFilters.tags.push(tag);
    updateActiveTagsDisplay();
    if (currentBoard) openBoard(currentBoard.id);
  }
};

// ============================================
// Due Date Rendering
// ============================================

function renderDueDate(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  let status = '';
  let icon = '';

  if (diffDays < 0) {
    status = 'overdue';
    icon = '🔴';
  } else if (diffDays <= 3) {
    status = 'upcoming';
    icon = '🟡';
  } else {
    return '';
  }

  return `<div class="duedate-indicator ${status}">${icon} ${due.toLocaleDateString()}</div>`;
}

// ============================================
// Drag and Drop
// ============================================

let draggedTask = null;

function enableDragAndDrop() {
  const taskCards = document.querySelectorAll('.task-card');
  const taskLists = document.querySelectorAll('.kanban-tasks');

  taskCards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedTask = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      draggedTask = null;
      card.classList.remove('dragging');
      taskLists.forEach(list => list.classList.remove('drag-over'));
    });
  });

  taskLists.forEach(list => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', () => {
      list.classList.remove('drag-over');
    });

    list.addEventListener('drop', async (e) => {
      e.preventDefault();
      list.classList.remove('drag-over');

      if (draggedTask) {
        const taskId = draggedTask.dataset.taskId;
        const newColumn = list.dataset.column;

        await fetchAPI(`/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ column: newColumn })
        });

        // Refresh board
        openBoard(currentBoard.id);
        loadActivities();
      }
    });
  });
}

// ============================================
// Modal Functions
// ============================================

function openModal(modal) {
  elements.modalOverlay.classList.add('active');
  modal.classList.add('active');
}

function closeModal(modal) {
  elements.modalOverlay.classList.remove('active');
  modal.classList.remove('active');
}

function closeAllModals() {
  elements.modalOverlay.classList.remove('active');
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// Create Board
elements.createBoardBtn.addEventListener('click', () => openModal(elements.createBoardModal));

// Add Task
elements.addTaskBtn.addEventListener('click', openAddTaskModal);

function openAddTaskModal() {
  if (!currentBoard) return;

  // Populate column select
  const columnSelect = document.getElementById('task-column-input');
  columnSelect.innerHTML = (currentBoard?.columns || ['Backlog', 'In Progress', 'Review', 'Done'])
    .map(col => `<option value="${col}">${col}</option>`)
    .join('');

  openModal(elements.addTaskModal);
}

// Back to Boards
elements.backToBoardsBtn.addEventListener('click', () => {
  elements.activityPanel.classList.add('hidden');
  switchView('boards');
});

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

elements.modalOverlay.addEventListener('click', closeAllModals);

// ============================================
// Create Board
// ============================================

elements.createBoardForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('board-name-input').value;
  const description = document.getElementById('board-desc-input').value;
  const columns = document.getElementById('board-columns-input').value
    .split(',')
    .map(c => c.trim())
    .filter(c => c);

  await fetchAPI('/boards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, columns })
  });

  elements.createBoardForm.reset();
  closeAllModals();
  loadBoards();
});

// ============================================
// Add Task
// ============================================

elements.addTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title-input').value;
  const description = document.getElementById('task-desc-input').value;
  const priority = document.getElementById('task-priority-input').value;
  const column = document.getElementById('task-column-input').value;
  const dueDate = document.getElementById('task-duedate-input').value || null;
  const tags = document.getElementById('task-tags-input').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  await fetchAPI(`/boards/${currentBoard.id}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, column, dueDate, tags })
  });

  elements.addTaskForm.reset();
  closeAllModals();
  openBoard(currentBoard.id);
});

// ============================================
// Task Detail Modal
// ============================================

window.openTaskDetail = async function(taskId) {
  try {
    const boards = await fetchAPI('/boards');
    const tasks = await fetchAPI(`/boards/${currentBoard.id}/tasks`);
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    currentTask = task;

    // Populate task detail
    elements.taskDetailTitle.textContent = task.title;
    elements.taskDetailPriority.textContent = (task.priority || 'medium').toUpperCase();
    elements.taskDetailPriority.className = `priority-badge ${task.priority || 'medium'}`;
    elements.taskDetailColumn.textContent = task.column;
    elements.taskDetailDuedate.textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    elements.taskDetailDesc.textContent = task.description || 'No description';
    elements.taskDetailCreated.textContent = new Date(task.createdAt).toLocaleString();
    elements.taskDetailUpdated.textContent = new Date(task.updatedAt).toLocaleString();

    // Tags
    elements.taskDetailTags.innerHTML = (task.tags || []).map(tag =>
      `<span class="task-tag">${tag}</span>`
    ).join('');

    // Render subtasks
    renderSubtasks(task);

    // Render notes
    renderTaskNotes(taskId);

    openModal(elements.taskDetailModal);
  } catch (err) {
    console.error('Failed to load task detail:', err);
  }
};

// ============================================
// Subtasks
// ============================================

function renderSubtasks(task) {
  const subtasks = task.subtasks || [];

  elements.subtasksList.innerHTML = subtasks.map(subtask => `
    <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
      <input type="checkbox" ${subtask.completed ? 'checked' : ''}
        onchange="toggleSubtask('${task.id}', '${subtask.id}')">
      <span>${subtask.title}</span>
      <button class="delete-subtask" onclick="deleteSubtask('${task.id}', '${subtask.id}')">&times;</button>
    </div>
  `).join('');

  if (subtasks.length === 0) {
    elements.subtasksList.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No subtasks yet</p>';
  }
}

window.toggleSubtask = async function(taskId, subtaskId) {
  try {
    const tasks = await fetchAPI(`/boards/${currentBoard.id}/tasks`);
    const task = tasks.find(t => t.id === taskId);

    if (task && task.subtasks) {
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        await fetchAPI(`/subtasks/${subtaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !subtask.completed })
        });

        openTaskDetail(taskId);
        openBoard(currentBoard.id);
      }
    }
  } catch (err) {
    console.error('Failed to toggle subtask:', err);
  }
};

window.deleteSubtask = async function(taskId, subtaskId) {
  if (!confirm('Delete this subtask?')) return;

  try {
    await fetchAPI(`/subtasks/${subtaskId}`, { method: 'DELETE' });
    openTaskDetail(taskId);
    openBoard(currentBoard.id);
  } catch (err) {
    console.error('Failed to delete subtask:', err);
  }
};

elements.addSubtaskBtn.addEventListener('click', () => {
  elements.addSubtaskForm.classList.toggle('hidden');
  elements.newSubtaskInput.focus();
});

elements.cancelSubtaskBtn.addEventListener('click', () => {
  elements.addSubtaskForm.classList.add('hidden');
  elements.newSubtaskInput.value = '';
});

elements.addSubtaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = elements.newSubtaskInput.value.trim();
  if (!title || !currentTask) return;

  try {
    await fetchAPI(`/tasks/${currentTask.id}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    elements.newSubtaskInput.value = '';
    elements.addSubtaskForm.classList.add('hidden');
    openTaskDetail(currentTask.id);
    openBoard(currentBoard.id);
  } catch (err) {
    console.error('Failed to add subtask:', err);
  }
});

// ============================================
// Task Notes
// ============================================

async function renderTaskNotes(taskId) {
  try {
    const notes = await fetchAPI(`/tasks/${taskId}/notes`);

    elements.taskNotesList.innerHTML = notes.map(note => `
      <div class="task-note-item">
        <div class="task-note-text">${note.note}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="task-note-time">${new Date(note.createdAt).toLocaleString()}</span>
          <button class="task-note-delete" onclick="deleteNote('${note.id}', '${taskId}')">Delete</button>
        </div>
      </div>
    `).join('');

    if (notes.length === 0) {
      elements.taskNotesList.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No notes yet</p>';
    }
  } catch (err) {
    console.error('Failed to load notes:', err);
  }
}

elements.addNoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const note = elements.newNoteInput.value.trim();
  if (!note || !currentTask) return;

  try {
    await fetchAPI(`/tasks/${currentTask.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });

    elements.newNoteInput.value = '';
    renderTaskNotes(currentTask.id);
  } catch (err) {
    console.error('Failed to add note:', err);
  }
});

window.deleteNote = async function(noteId, taskId) {
  if (!confirm('Delete this note?')) return;

  try {
    await fetchAPI(`/notes/${noteId}`, { method: 'DELETE' });
    renderTaskNotes(taskId);
  } catch (err) {
    console.error('Failed to delete note:', err);
  }
};

// ============================================
// Edit Task
// ============================================

elements.editCurrentTaskBtn.addEventListener('click', () => {
  if (!currentTask) return;

  // Populate form
  document.getElementById('edit-task-id').value = currentTask.id;
  document.getElementById('edit-task-title').value = currentTask.title;
  document.getElementById('edit-task-desc').value = currentTask.description || '';
  document.getElementById('edit-task-priority').value = currentTask.priority || 'medium';

  const columnSelect = document.getElementById('edit-task-column');
  columnSelect.innerHTML = (currentBoard?.columns || []).map(col =>
    `<option value="${col}" ${col === currentTask.column ? 'selected' : ''}>${col}</option>`
  ).join('');

  document.getElementById('edit-task-duedate').value = currentTask.dueDate || '';
  document.getElementById('edit-task-tags').value = (currentTask.tags || []).join(', ');

  closeAllModals();
  openModal(elements.editTaskModal);
});

elements.editTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const taskId = document.getElementById('edit-task-id').value;
  const title = document.getElementById('edit-task-title').value;
  const description = document.getElementById('edit-task-desc').value;
  const priority = document.getElementById('edit-task-priority').value;
  const column = document.getElementById('edit-task-column').value;
  const dueDate = document.getElementById('edit-task-duedate').value || null;
  const tags = document.getElementById('edit-task-tags').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  await fetchAPI(`/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, column, dueDate, tags })
  });

  closeAllModals();
  openBoard(currentBoard.id);
  loadActivities();
});

// ============================================
// Delete Task
// ============================================

elements.deleteCurrentTaskBtn.addEventListener('click', async () => {
  if (!currentTask) return;
  if (!confirm(`Delete task "${currentTask.title}"?`)) return;

  try {
    await fetchAPI(`/tasks/${currentTask.id}`, { method: 'DELETE' });
    closeAllModals();
    openBoard(currentBoard.id);
    loadActivities();
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
});

// ============================================
// Activity Feed
// ============================================

async function loadActivities() {
  try {
    const activities = await fetchAPI(`/boards/${currentBoard.id}/activities`);

    if (activities.length === 0) {
      elements.activityList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No activity yet</p>';
      return;
    }

    elements.activityList.innerHTML = activities.map(activity => {
      const timeAgo = getTimeAgo(new Date(activity.timestamp));
      let activityText = '';

      switch(activity.action) {
        case 'task_created':
          activityText = `Created task: <strong>${activity.details.title}</strong>`;
          break;
        case 'task_moved':
          activityText = `Moved <strong>${activity.details.title}</strong> from ${activity.details.from} to ${activity.details.to}`;
          break;
        default:
          activityText = activity.action;
      }

      return `
        <div class="activity-item">
          <div class="activity-time">${timeAgo}</div>
          <div class="activity-text">${activityText}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load activities:', err);
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

elements.activityToggleBtn.addEventListener('click', () => {
  elements.activityPanel.classList.toggle('hidden');
});

elements.closeActivityBtn.addEventListener('click', () => {
  elements.activityPanel.classList.add('hidden');
});

// ============================================
// Column Management
// ============================================

window.openAddColumnModal = function(afterColumn) {
  if (!currentBoard) return;

  const columns = currentBoard.columns || [];
  elements.newColumnPosition.innerHTML = columns.map((col, i) =>
    `<option value="${i}">${col}</option>`
  ).join('') + `<option value="${columns.length}" selected>End</option>`;

  openModal(elements.addColumnModal);
};

elements.addColumnForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = elements.newColumnName.value.trim();
  const position = parseInt(elements.newColumnPosition.value);

  if (!name) return;

  try {
    await fetchAPI(`/boards/${currentBoard.id}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, position })
    });

    elements.newColumnName.value = '';
    closeAllModals();
    openBoard(currentBoard.id);
  } catch (err) {
    console.error('Failed to add column:', err);
  }
});

window.deleteColumn = async function(columnName) {
  if (!confirm(`Delete column "${columnName}"? All tasks in this column will be deleted.`)) return;

  try {
    await fetchAPI(`/boards/${currentBoard.id}/columns/${columnName}`, { method: 'DELETE' });
    openBoard(currentBoard.id);
  } catch (err) {
    console.error('Failed to delete column:', err);
  }
};

// ============================================
// Export / Import / Backups
// ============================================

// Export Data
elements.exportBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_BASE}/export`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-control-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    console.log('✅ Data exported successfully');
  } catch (error) {
    console.error('❌ Export failed:', error);
    alert('Export failed: ' + error.message);
  }
});

// Import Data
elements.importBtn.addEventListener('click', () => openModal(elements.importModal));

elements.importForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('import-file-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file to import');
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const response = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Import successful!\n\nRestored: ${result.imported.boards} boards, ${result.imported.tasks} tasks, ${result.imported.notes} notes`);
      elements.importForm.reset();
      closeAllModals();

      // Refresh views
      if (currentView === 'dashboard') loadDashboard();
      if (currentView === 'boards') loadBoards();
      if (currentBoard) openBoard(currentBoard.id);
    } else {
      alert('Import failed: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    alert('Import failed: ' + error.message);
  }
});

// Backups
elements.backupsBtn.addEventListener('click', async () => {
  openModal(elements.backupsModal);
  loadBackups();
});

async function loadBackups() {
  try {
    const response = await fetch(`${API_BASE}/backups`);
    const { backups } = await response.json();

    if (backups.length === 0) {
      elements.backupsList.innerHTML = `
        <div class="backups-empty">
          <div style="font-size: 32px; margin-bottom: 12px;">🗂️</div>
          <div>No backups yet</div>
          <div style="font-size: 12px; margin-top: 8px;">Backups are created automatically every day</div>
        </div>
      `;
      return;
    }

    elements.backupsList.innerHTML = backups.map(backup => {
      const date = new Date(backup.createdAt);
      const sizeKB = (backup.size / 1024).toFixed(1);

      return `
        <div class="backup-item">
          <div class="backup-info">
            <div class="backup-name">${backup.name}</div>
            <div class="backup-meta">
              ${date.toLocaleString()} • ${sizeKB} KB
            </div>
          </div>
          <div class="backup-actions">
            <button class="backup-btn restore" onclick="restoreBackup('${backup.name}')">
              Restore
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load backups:', error);
    elements.backupsList.innerHTML = `
      <div class="backups-empty">
        <div style="font-size: 32px; margin-bottom: 12px;">❌</div>
        <div>Failed to load backups</div>
        <div style="font-size: 12px; margin-top: 8px;">${error.message}</div>
      </div>
    `;
  }
}

window.restoreBackup = async function(filename) {
  if (!confirm(`Restore from backup: ${filename}?\n\nThis will replace all current data. A backup will be created first.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/backups/${filename}/restore`, {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      alert(`✅ Restore successful!\n\nRestored: ${result.restored.boards} boards, ${result.restored.tasks} tasks, ${result.restored.notes} notes`);
      closeAllModals();

      // Refresh views
      if (currentView === 'dashboard') loadDashboard();
      if (currentView === 'boards') loadBoards();
      if (currentBoard) openBoard(currentBoard.id);
    } else {
      alert('Restore failed: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Restore failed:', error);
    alert('Restore failed: ' + error.message);
  }
};

// ============================================
// Initialize
// ============================================

loadDashboard();
setInterval(loadDashboard, 60000); // Refresh dashboard every minute
