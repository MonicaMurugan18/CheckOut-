'use strict';

/* ==========================================================================
   CheckOut — Task Management App
   Vanilla JavaScript (ES6)
   ========================================================================== */

/* ==========================================================================
   1. DOM REFERENCES
   ========================================================================== */
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('category');
const priorityInput = document.getElementById('priority');
const addTaskBtn = document.getElementById('addTask');

const searchInput = document.getElementById('searchTask');
const taskListEl = document.getElementById('taskList');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

const progressBarEl = document.getElementById('progressBar');
const progressTextEl = document.getElementById('progressText');

const darkModeToggleBtn = document.getElementById('darkModeToggle');
const navDarkModeBtn = document.getElementById('navDarkMode');

const navDashboardBtn = document.getElementById('navDashboard');
const navTasksBtn = document.getElementById('navTasks');
const navSearchBtn = document.getElementById('navSearch');

const dashboardSection = document.querySelector('.dashboard-cards');
const taskListSection = document.querySelector('.task-list-section');
const searchSection = document.querySelector('.search-section');

/* ==========================================================================
   2. STATE
   ========================================================================== */
let tasks = [];
let searchQuery = '';

/* ==========================================================================
   3. LOCAL STORAGE
   ========================================================================== */
const STORAGE_KEYS = {
  TASKS: 'checkout_tasks',
  THEME: 'checkout_theme'
};

// Save the current tasks array to Local Storage
function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// Save the current theme to Local Storage
function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// Retrieve tasks from Local Storage
function loadTasksFromStorage() {
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  return storedTasks ? JSON.parse(storedTasks) : [];
}

// Retrieve theme from Local Storage
function loadThemeFromStorage() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
}

/* ==========================================================================
   4. LOAD DATA
   ========================================================================== */
function loadData() {
  tasks = loadTasksFromStorage();
  const theme = loadThemeFromStorage();
  applyTheme(theme);
}

/* ==========================================================================
   5. ADD TASK
   ========================================================================== */
function addTask() {
  const taskName = taskInput.value.trim();

  if (taskName === '') {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    taskName: taskName,
    category: categoryInput.value,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();

  // Reset form
  taskInput.value = '';
  taskInput.focus();

  renderTasks();
  updateDashboard();
}

/* ==========================================================================
   6. RENDER TASKS
   ========================================================================== */
function renderTasks() {
  taskListEl.innerHTML = '';

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskListEl.innerHTML = `<p class="empty-state">No tasks found.</p>`;
    return;
  }

  filteredTasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    taskListEl.appendChild(taskCard);
  });
}

// Build a single task card element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''}`;
  card.dataset.id = task.id;

  card.innerHTML = `
    <div class="task-card-details">
      <span class="task-card-name">${escapeHTML(task.taskName)}</span>
      <div class="task-card-meta">
        <span class="task-tag category">${escapeHTML(task.category)}</span>
        <span class="task-tag priority-${task.priority.toLowerCase()}">${escapeHTML(task.priority)}</span>
      </div>
    </div>
    <div class="task-card-actions">
      <button class="complete-btn" title="Complete">
        <i class="fa-solid fa-check"></i>
      </button>
      <button class="edit-btn" title="Edit">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="delete-btn" title="Delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;

  // Attach event listeners
  card.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(task.id));
  card.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
  card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

  return card;
}

// Escape user input before inserting into the DOM
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================================================
   7. COMPLETE TASK
   ========================================================================== */
function toggleComplete(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
  updateDashboard();
}

/* ==========================================================================
   8. EDIT TASK
   ========================================================================== */
function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const updatedName = prompt('Edit task name:', task.taskName);
  if (updatedName === null) return; // Cancelled

  const trimmedName = updatedName.trim();
  if (trimmedName === '') return;

  task.taskName = trimmedName;

  saveTasks();
  renderTasks();
  updateDashboard();
}

/* ==========================================================================
   9. DELETE TASK
   ========================================================================== */
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
  updateDashboard();
}

/* ==========================================================================
   10. SEARCH
   ========================================================================== */
function handleSearch() {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderTasks();
}

// Filter tasks based on the current search query
function getFilteredTasks() {
  if (searchQuery === '') return tasks;

  return tasks.filter((task) =>
    task.taskName.toLowerCase().includes(searchQuery) ||
    task.category.toLowerCase().includes(searchQuery) ||
    task.priority.toLowerCase().includes(searchQuery)
  );
}

/* ==========================================================================
   11. DASHBOARD
   ========================================================================== */
function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;

  progressBarEl.style.width = `${progress}%`;
  progressTextEl.textContent = `${progress}%`;
}

/* ==========================================================================
   12. DARK MODE
   ========================================================================== */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  const theme = isDark ? 'dark' : 'light';
  saveTheme(theme);
}

/* ==========================================================================
   13. SIDEBAR NAVIGATION
   ========================================================================== */
// Mark the clicked nav item as active (Dark Mode excluded — it's a toggle, not a page section)
function setActiveNavItem(clickedItem) {
  [navDashboardBtn, navTasksBtn, navSearchBtn].forEach((item) => {
    if (item) item.classList.remove('active');
  });
  if (clickedItem) clickedItem.classList.add('active');
}

// Smoothly scroll a section into view
function scrollToSection(section) {
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToDashboard() {
  setActiveNavItem(navDashboardBtn);
  scrollToSection(dashboardSection);
}

function goToTasks() {
  setActiveNavItem(navTasksBtn);
  scrollToSection(taskListSection);
}

function goToSearch() {
  setActiveNavItem(navSearchBtn);
  scrollToSection(searchSection);
  searchInput.focus();
}

/* ==========================================================================
   14. INITIALIZATION
   ========================================================================== */
function initEventListeners() {
  addTaskBtn.addEventListener('click', addTask);

  // Allow adding a task by pressing Enter
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  searchInput.addEventListener('input', handleSearch);

  darkModeToggleBtn.addEventListener('click', toggleDarkMode);
  if (navDarkModeBtn) {
    navDarkModeBtn.addEventListener('click', toggleDarkMode);
  }

  if (navDashboardBtn) navDashboardBtn.addEventListener('click', goToDashboard);
  if (navTasksBtn) navTasksBtn.addEventListener('click', goToTasks);
  if (navSearchBtn) navSearchBtn.addEventListener('click', goToSearch);
}

function init() {
  loadData();
  initEventListeners();
  renderTasks();
  updateDashboard();
}

document.addEventListener('DOMContentLoaded', init);
