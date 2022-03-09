import Dexie from "dexie";

export const db = new Dexie("ToDoListDatabase");

db.version(5)
  .stores({
    tasks: "++id, name, priority, done",
    window: "id, top, left, width, height",
  });
