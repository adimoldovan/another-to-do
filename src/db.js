import Dexie from "dexie";

export const db = new Dexie("ToDoListDatabase");

db.version(7).stores({
  tasks: "++id, name, priority, complete"
}).upgrade (t => {
  return t.tasks.toCollection().modify (task => {
    task.complete = 0
  });
});
