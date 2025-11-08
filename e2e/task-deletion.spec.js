import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Deletion', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should delete a task', async () => {
    // Create a task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Task to delete');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Delete the task
    await window.click('.delete-btn');

    // Verify task is removed
    await waitForTaskCount(window, 0);
    const items = await window.locator('.item').all();
    expect(items).toHaveLength(0);
  });

  test('should delete specific task from multiple tasks', async () => {
    const tasks = ['Task 1', 'Task 2', 'Task 3'];

    // Create multiple tasks
    for (const task of tasks) {
      await window.click('.add-btn');
      await window.waitForSelector('#form-container[style*="display: block"]');
      await window.fill('textarea[placeholder="buy milk"]', task);
      await window.click('.save-btn');
      await window.waitForSelector('#form-container[style*="display: none"]');
    }

    await waitForTaskCount(window, 3);

    // Delete the second task (Task 2)
    const deleteButtons = await window.locator('.delete-btn').all();
    await deleteButtons[1].click();

    // Verify count and remaining tasks
    await waitForTaskCount(window, 2);
    const remainingTasks = await window.locator('.item-content').allTextContents();
    expect(remainingTasks.join(' ')).toContain('Task 3');
    expect(remainingTasks.join(' ')).toContain('Task 1');
    expect(remainingTasks.join(' ')).not.toContain('Task 2');
  });
});
