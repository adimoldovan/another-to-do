import Dexie from "dexie";

export const db = new Dexie("ToDoListDatabase");
db.version(3).stores({
  tasks: "++id, name, priority",
}).upgrade (transaction => {
  return transaction.tasks.toCollection().modify (task => {
    task.priority = task.id;
  });
});

// db.version(1).stores({
//   tasks: "++id, name",
// });
