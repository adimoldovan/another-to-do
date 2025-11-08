import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Task Editing', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);

    // Create a task to edit
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Original task');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should edit a task by double-clicking', async () => {
    // Double-click the task
    await window.dblclick('.item');

    // Wait for modal with task content
    await window.waitForSelector('#form-container[style*="display: block"]');
    const textareaValue = await window.inputValue('textarea[placeholder="buy milk"]');
    expect(textareaValue).toBe('Original task');

    // Edit the task
    await window.fill('textarea[placeholder="buy milk"]', 'Updated task');
    await window.click('.save-btn');

    // Verify update
    await window.waitForSelector('#form-container[style*="display: none"]');
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Updated task');
    expect(taskText).not.toContain('Original task');
  });

  test('should preserve task when editing is cancelled', async () => {
    // Double-click the task
    await window.dblclick('.item');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Change text but press Escape
    await window.fill('textarea[placeholder="buy milk"]', 'Changed text');
    await window.press('textarea', 'Escape');

    // Verify modal closed and original text preserved
    await window.waitForSelector('#form-container[style*="display: none"]');
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Original task');
  });
});
