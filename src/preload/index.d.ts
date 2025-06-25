import { ElectronAPI } from '@electron-toolkit/preload'

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getTodos: () => Promise<Todo[]>
      addTodo: (todo: Todo) => Promise<Todo[]>
      updateTodo: (todo: Todo) => Promise<Todo[]>
      deleteTodo: (id: string) => Promise<Todo[]>
    }
  }
}
