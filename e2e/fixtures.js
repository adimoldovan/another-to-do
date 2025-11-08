import { test as base } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use, testInfo) => {
    // Create a unique user data directory for this test
    const userDataDir = path.join(__dirname, '..', 'test-results', `.user-data-${testInfo.workerIndex}-${Date.now()}`);
    fs.mkdirSync(userDataDir, { recursive: true });

    // Launch Electron app with isolated user data
    const electronApp = await electron.launch({
      args: ['.', `--user-data-dir=${userDataDir}`],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      },
      timeout: 30000
    });

    // Provide the app to the test
    await use(electronApp);

    // Cleanup after test
    await electronApp.close();

    // Clean up user data directory
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },

  window: async ({ electronApp }, use) => {
    // Wait for the first window
    let window = await electronApp.firstWindow();

    // Capture console errors
    window.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });

    // Capture page errors
    window.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });

    // Wait for app to be ready
    await window.waitForLoadState('load');

    // Wait for the app to render by checking for the add button
    await window.waitForSelector('.add-btn', { timeout: 30000 });

    // Provide the window to the test
    await use(window);
  }
});

export { expect } from '@playwright/test';

// Helper function to wait for specific task count
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
