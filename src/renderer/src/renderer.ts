type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

function setDateHeading(): void {
  const dateEl = document.getElementById('todo-date')
  if (dateEl) {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    dateEl.textContent = now.toLocaleDateString(undefined, options)
  }
}

function setAddButtonIcon(): void {
  const btn = document.getElementById('add-todo-btn')
  if (btn) {
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" stroke="#f4f4f8" stroke-width="1.5" fill="#444"/>
        <path d="M10 6V14" stroke="#f4f4f8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M6 10H14" stroke="#f4f4f8" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `
  }
}

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    setDateHeading()
    setAddButtonIcon()
    doAThing()
    setupTodoUI()
    loadTodos()
  })
}

function doAThing(): void {
  const versions = window.electron.process.versions
  replaceText('.electron-version', `Electron v${versions.electron}`)
  replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  replaceText('.node-version', `Node v${versions.node}`)

  const ipcHandlerBtn = document.getElementById('ipcHandler')
  ipcHandlerBtn?.addEventListener('click', () => {
    window.electron.ipcRenderer.send('ping')
  })
}

function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) {
    element.innerText = text
  }
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]||c));
}

function renderTodos(todos: Todo[]): void {
  const list = document.getElementById('todo-list')
  if (!list) return;
  list.innerHTML = ''
  todos.forEach(todo => {
    if (!todo.completed) {
      const li = document.createElement('li')
      li.className = 'todo-item'
      li.innerHTML = `
        <span class="todo-text" style="white-space: pre-wrap;">${escapeHtml(todo.text)}</span>
        <button data-id="${todo.id}" class="toggle-todo" title="Mark Complete" style="margin-left: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10.5L9 14.5L15 7.5" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button data-id="${todo.id}" class="delete-todo" title="Delete" style="margin-left: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 7.5V14.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M10 7.5V14.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13.5 7.5V14.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="4.5" y="4.5" width="11" height="13" rx="2" stroke="#ef4444" stroke-width="1.5"/>
            <path d="M2.5 4.5H17.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8.5 2.5H11.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      `
      list.appendChild(li)
    }
  })
}

async function loadTodos(): Promise<void> {
  const todos = await window.api.getTodos()
  renderTodos(todos)
}

async function addTodo(text: string): Promise<void> {
  const todo: Todo = { id: crypto.randomUUID(), text, completed: false }
  await window.api.addTodo(todo)
  loadTodos()
}

async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  const todos = await window.api.getTodos()
  const todo = todos.find((t: Todo) => t.id === id)
  if (todo) {
    const updated = { ...todo, ...updates }
    await window.api.updateTodo(updated)
    loadTodos()
  }
}

async function deleteTodo(id: string): Promise<void> {
  await window.api.deleteTodo(id)
  loadTodos()
}

function setupTodoUI(): void {
  const form = document.getElementById('todo-form') as HTMLFormElement | null
  const input = document.getElementById('todo-input') as HTMLTextAreaElement | null
  const list = document.getElementById('todo-list')
  if (!form || !input || !list) return;

  // Autosize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  });

  form.addEventListener('submit', e => {
    e.preventDefault()
    const text = input.value.trim()
    if (text) {
      addTodo(text)
      input.value = ''
      input.style.height = 'auto';
    }
  })

  input.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      form.requestSubmit()
    }
    // Otherwise, Enter adds a new line (default for textarea)
  })

  list.addEventListener('click', e => {
    const target = e.target as HTMLElement
    if (target.classList.contains('delete-todo')) {
      const id = target.getAttribute('data-id')
      if (id) deleteTodo(id)
    }
    if (target.classList.contains('toggle-todo')) {
      const id = target.getAttribute('data-id')
      if (id) {
        window.api.getTodos().then(todos => {
          const todo = todos.find((t: Todo) => t.id === id)
          if (todo) updateTodo(id, { completed: !todo.completed })
        })
      }
    }
  })
}

init()
