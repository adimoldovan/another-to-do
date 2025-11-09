import { format } from 'date-fns';
import { db, configureCloudSync, dbName, isPackaged, isTest } from './db.js';
import { liveQuery } from 'dexie';
import { detectAndLinkUrls, getUrlHost } from './utils/urlDetector.js';
import { setupDragHandlers } from './utils/dragDrop.js';
import { initSyncStatus } from './components/syncStatus.js';
import { loadSettings, setDexieCloudUrl } from './settings.js';

// State
const state = {
  complete: 0,
  now: new Date(),
  currentItem: emptyItem(),
  tasks: [],
  totalCount: 0,
  theme: 'light', // default theme
};

// Theme management
function initTheme() {
  // Load theme from localStorage or default to 'light'
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Initialize app
function init() {
  setupDateTimer();
  initTheme(); // Initialize theme from localStorage
  setupEventListeners();
  subscribeToTasks();
  subscribeToTaskCount();
  renderDate();
  initSyncStatus(); // Initialize cloud sync UI
  renderFooter(); // Show DB name and mode
}

// Render footer info
function renderFooter() {
  const footerInfoEl = document.getElementById('footer-info');

  if (footerInfoEl) {
    const mode = isTest ? 'test' : (isPackaged ? 'production' : 'development');
    const parts = [`DB: ${dbName}`, `Mode: ${mode}`];

    // Add path if available
    if (!isTest && window.electronAPI?.userDataPath) {
      parts.push(`Path: ${window.electronAPI.userDataPath}`);
    }

    footerInfoEl.textContent = parts.join(' · ');
  }

  console.log('Database:', dbName);
  console.log('isPackaged:', isPackaged);
  console.log('electronAPI:', window.electronAPI);
}

function emptyItem() {
  return { name: '', priority: 1000, complete: 0 };
}

// Date timer
function setupDateTimer() {
  setInterval(() => {
    state.now = new Date();
    renderDate();
  }, 3600 * 1000);
}

function renderDate() {
  const dateEl = document.querySelector('.today');
  if (dateEl) {
    dateEl.textContent = `${format(state.now, 'EEEE')}, ${format(state.now, 'd')} ${format(state.now, 'MMM')}`;
  }
}

// Database subscriptions
let tasksSubscription = null;

function subscribeToTasks() {
  // Unsubscribe from previous subscription if exists
  if (tasksSubscription) {
    tasksSubscription.unsubscribe();
  }

  // Create new subscription with current filter
  tasksSubscription = liveQuery(async () => {
    let tasks = await db.tasks
      .where('complete')
      .equals(state.complete)
      .sortBy('priority');

    return tasks.map(task => {
      const { linkedText, urls } = detectAndLinkUrls(task.name);
      return {
        ...task,
        displayName: linkedText,
        urls: urls,
      };
    });
  }).subscribe(tasks => {
    state.tasks = tasks;
    renderTasks();
  });
}

function subscribeToTaskCount() {
  liveQuery(() => db.tasks.count()).subscribe(count => {
    state.totalCount = count;
    renderCount();
  });
}

// Render functions
function renderTasks() {
  const container = document.querySelector('.items');
  if (!container) return;

  // Keep top actions
  const topActions = container.querySelector('.top-actions');

  // Clear items
  const items = container.querySelectorAll('.item');
  items.forEach(item => item.remove());

  // Render tasks
  state.tasks.forEach((task, index) => {
    const itemEl = createTaskElement(task, index);
    container.appendChild(itemEl);
  });
}

function createTaskElement(task, index) {
  const div = document.createElement('div');
  div.id = `item-${index}`;
  div.className = 'item';

  div.innerHTML = `
    <div class="item-row">
      <div class="item-content">
        <div>${task.displayName}</div>
        <div class="task-urls">
          ${(task.urls || []).map(url =>
            `<a target="_blank" title="${url}" class="task-url" href="${url}">${getUrlHost(url)}</a>`
          ).join('')}
        </div>
      </div>
      <div class="item-actions">
        <a href="#" class="btn action-btn done-btn" title="${task.complete ? 'Restore task' : 'Mark as complete'}">
          ${task.complete
            ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2,8 A6,6 0 1,1 8,14"></path><polyline points="2,4 2,8 6,8"></polyline></svg>'
            : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,8 6,11 13,4"></polyline></svg>'
          }
        </a>
        <a href="#" class="btn action-btn delete-btn" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3,3 L13,13 M13,3 L3,13"></path>
          </svg>
        </a>
      </div>
    </div>
  `;

  // Event listeners
  div.querySelector('.done-btn').addEventListener('click', (e) => {
    e.preventDefault();
    updateItemStatus(task);
  });

  div.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteItem(task.id);
  });

  div.addEventListener('dblclick', () => editItem(task.id));

  // Drag and drop
  setupDragHandlers(div, task, index);

  return div;
}

function renderCount() {
  const countEl = document.querySelector('.count');
  if (countEl) {
    const text = state.totalCount === null ? 'checking...' : `${state.totalCount} total items`;
    countEl.textContent = text;
  }
}

// Event listeners
function setupEventListeners() {
  // Add button
  document.querySelector('.add-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
  });

  // Toggle filter
  document.querySelector('.filter-toggle')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.complete = state.complete === 0 ? 1 : 0;
    updateFilterText();
    subscribeToTasks(); // Re-subscribe with new filter
  });

  // Modal close
  document.querySelector('.close')?.addEventListener('click', () => {
    closeModal();
  });

  // Modal form submit
  document.querySelector('#task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
  });

  // Save button
  document.querySelector('.save-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    submitForm();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSettingsModal();
    }
  });

  // Settings modal event listeners
  window.addEventListener('show-settings', showSettingsModal);

  document.querySelector('.close-settings')?.addEventListener('click', () => {
    closeSettingsModal();
  });

  document.querySelector('#cancel-settings')?.addEventListener('click', () => {
    closeSettingsModal();
  });

  document.querySelector('#settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettingsForm();
  });
}

function updateFilterText() {
  const filterLink = document.querySelector('.filter-toggle');
  if (filterLink) {
    filterLink.textContent = `show ${state.complete === 0 ? 'completed' : 'open'} items`;
  }
}

// Task operations
async function submitForm() {
  const textarea = document.querySelector('#task-input');
  const taskName = textarea.value.trim();

  if (!taskName) return;

  if (state.currentItem.id) {
    // Update existing
    if (parseFloat(state.currentItem.priority) * 10000 === 0) {
      state.currentItem.priority = state.currentItem.id;
    }
    await db.tasks.update(state.currentItem.id, {
      name: taskName,
      priority: state.currentItem.priority,
    });
    console.log(`Task was updated`);
  } else {
    // Create new
    const firstItem = await db.tasks.orderBy('priority').first();
    const priority = firstItem ? firstItem.priority - 1 : 1;

    await db.tasks.add({
      id: crypto.randomUUID(),
      name: taskName,
      priority: priority,
      complete: 0,
    });
    console.log(`Task was created`);
  }

  closeModal();
}

async function deleteItem(itemId) {
  await db.tasks.where('id').equals(itemId).delete();
  console.log(`Deleted item ${itemId}`);
}

async function updateItemStatus(item) {
  await db.tasks.update(item.id, { complete: item.complete === 0 ? 1 : 0 });
  console.log(`Item ${item.id} was updated`);
}

async function editItem(itemId) {
  console.log(`Editing item ${itemId}`);
  const task = await db.tasks.where('id').equals(itemId).first();
  state.currentItem = { ...task };
  showModal();
}

// Modal
function showModal() {
  const modal = document.getElementById('form-container');
  const textarea = document.querySelector('#task-input');

  if (modal && textarea) {
    textarea.value = state.currentItem.name || '';
    modal.style.display = 'block';
    textarea.focus();
  }
}

function closeModal() {
  const modal = document.getElementById('form-container');
  if (modal) {
    modal.style.display = 'none';
    state.currentItem = emptyItem();
  }
}

// Settings Modal
function showSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const input = document.querySelector('#dexie-cloud-url');

  if (modal && input) {
    // Load current settings
    const settings = loadSettings();
    input.value = settings.dexieCloudUrl || '';

    // Set up theme selector
    updateThemeOptions();
    setupThemeSelectors();

    modal.style.display = 'block';
    input.focus();
  }
}

function updateThemeOptions() {
  // Update active state on theme options
  document.querySelectorAll('.theme-option').forEach(option => {
    const theme = option.getAttribute('data-theme');
    if (theme === state.theme) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

function setupThemeSelectors() {
  // Remove old listeners and add new ones
  document.querySelectorAll('.theme-option').forEach(option => {
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);

    newOption.addEventListener('click', () => {
      const theme = newOption.getAttribute('data-theme');
      setTheme(theme);
      updateThemeOptions();
    });
  });
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveSettingsForm() {
  const input = document.querySelector('#dexie-cloud-url');
  const url = input.value.trim();

  // Validate URL if provided
  if (url && !isValidDexieCloudUrl(url)) {
    alert('Invalid Dexie Cloud URL. Format: https://YOUR_DB_ID.dexie.cloud');
    return;
  }

  // Save settings
  setDexieCloudUrl(url);

  // Reconfigure cloud sync
  configureCloudSync();

  // Close modal
  closeSettingsModal();

  // Reload page to apply changes
  alert('Settings saved! Reloading app to apply changes...');
  window.location.reload();
}

function isValidDexieCloudUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.endsWith('.dexie.cloud');
  } catch {
    return false;
  }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
