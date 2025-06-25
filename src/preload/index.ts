import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  addTodo: (todo) => ipcRenderer.invoke('add-todo', todo),
  updateTodo: (todo) => ipcRenderer.invoke('update-todo', todo),
  deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
