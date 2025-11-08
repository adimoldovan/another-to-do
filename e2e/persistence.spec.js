import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Data Persistence', () => {
  test.beforeAll(async () => {
    // Clear database before all tests
    const { electronApp, window } = await launchElectronApp();
    await clearDatabase(window);
    await closeElectronApp(electronApp);
  });

  test('should persist tasks across app restarts', async () => {
    // First session: create tasks
    let { electronApp, window } = await launchElectronApp();

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Persistent task 1');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Persistent task 2');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 2);

    // Close app
    await closeElectronApp(electronApp);

    // Second session: verify tasks still exist
    ({ electronApp, window } = await launchElectronApp());

    await waitForTaskCount(window, 2);
    const tasks = await window.locator('.item-content').allTextContents();
    expect(tasks.join(' ')).toContain('Persistent task 1');
    expect(tasks.join(' ')).toContain('Persistent task 2');

    // Cleanup
    await clearDatabase(window);
    await closeElectronApp(electronApp);
  });

  test('should persist completed status', async () => {
    // First session: create and complete task
    let { electronApp, window } = await launchElectronApp();

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Task to complete');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Mark as complete
    await window.click('.done-btn');
    await waitForTaskCount(window, 0);

    // Close app
    await closeElectronApp(electronApp);

    // Second session: verify task is still completed
    ({ electronApp, window } = await launchElectronApp());

    // Should have no open tasks
    await waitForTaskCount(window, 0);

    // Switch to completed view
    await window.click('text=show completed items');
    await waitForTaskCount(window, 1);

    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Task to complete');

    // Cleanup
    await clearDatabase(window);
    await closeElectronApp(electronApp);
  });
});
