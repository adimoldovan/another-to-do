import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Creation', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should create a new task', async () => {
    // Click the add button
    await window.click('.add-btn');

    // Wait for modal to appear
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Type task name
    await window.fill('textarea[placeholder="buy milk"]', 'Buy groceries');

    // Click save button
    await window.click('.save-btn');

    // Wait for modal to close
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Verify task appears in list
    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Buy groceries');
  });

  test('should create multiple tasks', async () => {
    const tasks = ['Task 1', 'Task 2', 'Task 3'];

    for (const task of tasks) {
      await window.click('.add-btn');
      await window.waitForSelector('#form-container[style*="display: block"]');
      await window.fill('textarea[placeholder="buy milk"]', task);
      await window.click('.save-btn');
      await window.waitForSelector('#form-container[style*="display: none"]');
    }

    await waitForTaskCount(window, 3);
    const items = await window.locator('.item').all();
    expect(items).toHaveLength(3);
  });

  test('should add new tasks at the top of the list', async () => {
    // Create first task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'First task');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Create second task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Second task');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 2);

    // Verify second task is at the top
    const firstItem = await window.locator('.item').first().textContent();
    expect(firstItem).toContain('Second task');
  });
});
