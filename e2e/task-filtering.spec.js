import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Filtering', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);

    // Create open tasks
    for (let i = 1; i <= 2; i++) {
      await window.click('.add-btn');
      await window.waitForSelector('#form-container[style*="display: block"]');
      await window.fill('textarea[placeholder="buy milk"]', `Open task ${i}`);
      await window.click('.save-btn');
      await window.waitForSelector('#form-container[style*="display: none"]');
    }

    await waitForTaskCount(window, 2);

    // Mark first task as complete
    const doneButtons = await window.locator('.done-btn').all();
    await doneButtons[0].click();
    await waitForTaskCount(window, 1);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should show only open items by default', async () => {
    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Open task 2');
  });

  test('should toggle to show completed items', async () => {
    // Click to show completed
    await window.click('text=show completed items');

    // Should see 1 completed task
    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Open task 1');
  });

  test('should toggle back to show open items', async () => {
    // Switch to completed
    await window.click('text=show completed items');
    await waitForTaskCount(window, 1);

    // Switch back to open
    await window.click('text=show open items');
    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Open task 2');
  });

  test('should show correct total count regardless of filter', async () => {
    // In open view, should show 2 total
    let countText = await window.textContent('.count');
    expect(countText).toContain('2 total items');

    // In completed view, should still show 2 total
    await window.click('text=show completed items');
    countText = await window.textContent('.count');
    expect(countText).toContain('2 total items');
  });
});
