import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Reordering', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);

    // Create three tasks
    const tasks = ['Task A', 'Task B', 'Task C'];
    for (const task of tasks) {
      await window.click('.add-btn');
      await window.waitForSelector('#form-container[style*="display: block"]');
      await window.fill('textarea[placeholder="buy milk"]', task);
      await window.click('.save-btn');
      await window.waitForSelector('#form-container[style*="display: none"]');
    }

    await waitForTaskCount(window, 3);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should allow drag-and-drop reordering', async () => {
    // Get initial order (C, B, A since tasks are added at top)
    let taskOrder = await window.locator('.item-content').allTextContents();
    expect(taskOrder[0]).toContain('Task C');
    expect(taskOrder[1]).toContain('Task B');
    expect(taskOrder[2]).toContain('Task A');

    // Drag Task C (index 0) to position of Task A (index 2)
    const sourceItem = await window.locator('.item').nth(0);
    const targetItem = await window.locator('.item').nth(2);

    await sourceItem.dragTo(targetItem);

    // Wait a moment for reordering
    await window.waitForTimeout(500);

    // Verify new order
    taskOrder = await window.locator('.item-content').allTextContents();
    // Task C should now be below Task B
    const indexB = taskOrder.findIndex(t => t.includes('Task B'));
    const indexC = taskOrder.findIndex(t => t.includes('Task C'));
    expect(indexC).toBeGreaterThan(indexB);
  });

  test('should persist order after drag-and-drop', async () => {
    // Perform drag operation
    const sourceItem = await window.locator('.item').nth(0);
    const targetItem = await window.locator('.item').nth(2);
    await sourceItem.dragTo(targetItem);
    await window.waitForTimeout(500);

    // Get order after drag
    const orderAfterDrag = await window.locator('.item-content').allTextContents();

    // Close and reopen app
    await closeElectronApp(electronApp);
    ({ electronApp, window } = await launchElectronApp());

    await waitForTaskCount(window, 3);

    // Verify order is the same
    const orderAfterRestart = await window.locator('.item-content').allTextContents();
    expect(orderAfterRestart[0]).toContain(orderAfterDrag[0].trim());
    expect(orderAfterRestart[1]).toContain(orderAfterDrag[1].trim());
    expect(orderAfterRestart[2]).toContain(orderAfterDrag[2].trim());
  });
});
