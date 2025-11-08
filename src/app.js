import { format } from 'date-fns';
import { db } from './db.js';
import { liveQuery } from 'dexie';
import { detectAndLinkUrls, getUrlHost } from './utils/urlDetector.js';
import { setupDragHandlers } from './utils/dragDrop.js';

// State
const state = {
  complete: 0,
  now: new Date(),
  currentItem: emptyItem(),
  tasks: [],
  totalCount: 0,
};

// Initialize app
function init() {
  setupDateTimer();
  setupEventListeners();
  subscribeToTasks();
  subscribeToTaskCount();
  renderDate();
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
function subscribeToTasks() {
  liveQuery(async () => {
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
        <a href="#" class="btn action-btn done-btn">&check;</a>
        <a href="#" class="btn action-btn delete-btn">&cross;</a>
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
    }
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

// Start app
document.addEventListener('DOMContentLoaded', init);
