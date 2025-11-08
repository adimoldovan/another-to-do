import { test } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Completion', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);

    // Create a task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Task to complete');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should mark task as complete', async () => {
    // Mark as complete
    await window.click('.done-btn');

    // Task should disappear from open items view
    await waitForTaskCount(window, 0);
  });

  test('should toggle between complete and incomplete', async () => {
    // Mark as complete
    await window.click('.done-btn');
    await waitForTaskCount(window, 0);

    // Switch to completed view
    await window.click('text=show completed items');

    // Should see 1 completed task
    await waitForTaskCount(window, 1);

    // Mark as incomplete
    await window.click('.done-btn');

    // Should disappear from completed view
    await waitForTaskCount(window, 0);

    // Switch back to open items
    await window.click('text=show open items');

    // Should see task back in open items
    await waitForTaskCount(window, 1);
  });
});
