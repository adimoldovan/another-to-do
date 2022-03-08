import Dexie from "dexie";

export const db = new Dexie("ToDoListDatabase");
db.version(1).stores({
  tasks: "++id, name",
});
