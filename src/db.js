import Dexie from "dexie";
import dexieCloud from "dexie-cloud-addon";
import { getDexieCloudUrl } from "./settings.js";

export const db = new Dexie("ToDoListDatabase", { addons: [dexieCloud] });

/**
 * Configure cloud sync with user's settings
 * This can be called at app start or when settings change
 */
export function configureCloudSync() {
  const cloudUrl = getDexieCloudUrl();

  if (cloudUrl) {
    console.log('Configuring Dexie Cloud sync:', cloudUrl);
    try {
      db.cloud.configure({
        databaseUrl: cloudUrl,
        requireAuth: false, // Allow offline usage without login
      });
      return true;
    } catch (error) {
      console.error('Failed to configure Dexie Cloud:', error);
      return false;
    }
  } else {
    console.log('Running in local-only mode (no cloud sync configured)');
    return false;
  }
}

/**
 * Check if cloud sync is configured
 */
export function isCloudConfigured() {
  return !!getDexieCloudUrl();
}

// Database schema
// Note: We use auto-increment IDs for simplicity
// Dexie Cloud will handle syncing even with auto-increment IDs
db.version(8).stores({
  tasks: "++id, name, priority, complete"
}).upgrade((t) => {
  return t.tasks.toCollection().modify((task) => {
    task.complete = task.complete || 0;
  });
});

// Configure cloud sync on module load
configureCloudSync();
