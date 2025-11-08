import { _electron as electron } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function launchElectronApp() {
  // Electron 39+ doesn't support --remote-debugging-port flag
  // We need to use a custom chromium debugging port env var
  const electronApp = await electron.launch({
    args: [path.join(__dirname, '../../main.js')],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_RUN_AS_NODE: '0'
    },
    timeout: 30000
  });

  const window = await electronApp.firstWindow();

  // Wait for app to be ready
  await window.waitForLoadState('domcontentloaded');
  await window.waitForSelector('.items', { timeout: 10000 });

  return { electronApp, window };
}

export async function closeElectronApp(electronApp) {
  await electronApp.close();
}

export async function clearDatabase(window) {
  // Clear all tasks from IndexedDB
  await window.evaluate(async () => {
    const { db } = await import('./src/db.js');
    await db.tasks.clear();
  });
}

export async function waitForTaskCount(window, count) {
  await window.waitForFunction(
    (expectedCount) => {
      const items = document.querySelectorAll('.item');
      return items.length === expectedCount;
    },
    count,
    { timeout: 5000 }
  );
}
