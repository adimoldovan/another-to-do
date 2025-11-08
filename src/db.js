import Dexie from "dexie";
import dexieCloud from "dexie-cloud-addon";
import { getDexieCloudUrl } from "./settings.js";

// Use different database names for dev/test/prod to avoid conflicts
// Check if running in Electron packaged app via environment variable set by main process
const isPackaged = window.electronAPI?.isPackaged ?? false;
const isTest = import.meta.env.MODE === 'test';
const dbName = isTest ? "ya2d-test" : (isPackaged ? "ya2d" : "ya2d-dev");

export const db = new Dexie(dbName, { addons: [dexieCloud] });
export { dbName, isPackaged, isTest };

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
// Note: Dexie Cloud requires string-based primary keys for sync
// Changed from auto-increment (++id) to string (id) in v9
db.version(9).stores({
  tasks: "id, name, priority, complete"
}).upgrade((t) => {
  return t.tasks.toCollection().modify((task) => {
    task.complete = task.complete || 0;
    // Generate string ID for existing tasks if they don't have one
    if (!task.id || typeof task.id === 'number') {
      task.id = crypto.randomUUID();
    }
  });
});

// Configure cloud sync on module load
configureCloudSync();
