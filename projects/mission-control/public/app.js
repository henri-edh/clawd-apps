/**
 * Mission Control - Frontend Application
 * Handles UI interactions, API calls, and drag-and-drop
 */

const API_BASE = '/api';
let currentBoard = null;
let currentView = 'dashboard';

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
  createBoardForm: document.getElementById('create-board-form'),
  addTaskForm: document.getElementById('add-task-form')
};

// Navigation
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

// API Functions
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// Dashboard
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
          ${task.column} • ${new Date(task.updated_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');

    elements.lastUpdated.textContent = new Date().toLocaleString();
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

// Boards
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

// Open Board
async function openBoard(boardId) {
  try {
    const boards = await fetchAPI('/boards');
    currentBoard = boards.find(b => b.id === boardId);

    if (!currentBoard) return;

    elements.boardTitle.textContent = currentBoard.name;

    const tasks = await fetchAPI(`/boards/${boardId}/tasks`);
    renderKanbanBoard(tasks);

    elements.views.forEach(v => v.classList.remove('active'));
    elements.boardDetailView.classList.add('active');
    elements.navItems.forEach(i => i.classList.remove('active'));
  } catch (err) {
    console.error('Failed to open board:', err);
  }
}

// Render Kanban Board
function renderKanbanBoard(tasks) {
  const columns = currentBoard.columns || ['Backlog', 'In Progress', 'Review', 'Done'];

  elements.kanbanBoard.innerHTML = columns.map(column => {
    const columnTasks = tasks.filter(t => t.column === column);
    return `
      <div class="kanban-column" data-column="${column}">
        <div class="kanban-column-header">
          <h4>${column}</h4>
          <span class="task-count">${columnTasks.length}</span>
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

// Render Task Card
function renderTaskCard(task) {
  const tags = Array.isArray(task.tags) ? task.tags : [];
  return `
    <div class="task-card" draggable="true" data-task-id="${task.id}">
      <div class="task-card-header">
        <div class="task-title">${task.title}</div>
        <span class="task-priority ${task.priority || 'medium'}">${task.priority || 'medium'}</span>
      </div>
      ${task.description ? `<p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0;">${task.description.substring(0, 100)}...</p>` : ''}
      ${tags.length > 0 ? `
        <div class="task-tags">
          ${tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Drag and Drop
let draggedTask = null;

function enableDragAndDrop() {
  const taskCards = document.querySelectorAll('.task-card');
  const taskLists = document.querySelectorAll('.kanban-tasks');

  taskCards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedTask = card;
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
      draggedTask = null;
      card.style.opacity = '1';
    });
  });

  taskLists.forEach(list => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    list.addEventListener('drop', async (e) => {
      e.preventDefault();
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
      }
    });
  });
}

// Modal Functions
function openModal(modal) {
  elements.modalOverlay.classList.add('active');
  modal.classList.add('active');
}

function closeModal(modal) {
  elements.modalOverlay.classList.remove('active');
  modal.classList.remove('active');
}

elements.createBoardBtn.addEventListener('click', () => openModal(elements.createBoardModal));
elements.addTaskBtn.addEventListener('click', () => {
  // Populate column select
  const columnSelect = document.getElementById('task-column-input');
  columnSelect.innerHTML = (currentBoard?.columns || ['Backlog', 'In Progress', 'Review', 'Done'])
    .map(col => `<option value="${col}">${col}</option>`)
    .join('');
  openModal(elements.addTaskModal);
});
elements.backToBoardsBtn.addEventListener('click', () => switchView('boards'));

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(elements.createBoardModal);
    closeModal(elements.addTaskModal);
  });
});

elements.modalOverlay.addEventListener('click', () => {
  closeModal(elements.createBoardModal);
  closeModal(elements.addTaskModal);
});

// Create Board
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
  closeModal(elements.createBoardModal);
  loadBoards();
});

// Add Task
elements.addTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title-input').value;
  const description = document.getElementById('task-desc-input').value;
  const priority = document.getElementById('task-priority-input').value;
  const column = document.getElementById('task-column-input').value;
  const tags = document.getElementById('task-tags-input').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  await fetchAPI(`/boards/${currentBoard.id}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, column, tags })
  });

  elements.addTaskForm.reset();
  closeModal(elements.addTaskModal);
  openBoard(currentBoard.id);
});

// Initialize
loadDashboard();
setInterval(loadDashboard, 60000); // Refresh dashboard every minute
