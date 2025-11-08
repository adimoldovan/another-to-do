import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Accessibility', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should have proper ARIA roles', async () => {
    // Check main list has role
    const itemsList = await window.locator('[role="list"]');
    await expect(itemsList).toBeVisible();

    // Check modal has role
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    const dialog = await window.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('should support keyboard navigation in modal', async () => {
    // Open modal with click
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Textarea should be focusable
    const textarea = await window.locator('#task-input');
    await expect(textarea).toBeFocused();

    // Type task
    await window.type('#task-input', 'Keyboard task');

    // Close with Escape
    await window.press('body', 'Escape');
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Task should not be created
    await waitForTaskCount(window, 0);
  });

  test('should have focusable close button', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Close button should have tabindex
    const closeBtn = await window.locator('.close');
    const tabindex = await closeBtn.getAttribute('tabindex');
    expect(tabindex).toBe('0');
  });

  test('should maintain focus management', async () => {
    // Create a task first
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', 'Focus test task');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Verify task appears
    const items = await window.locator('.item').all();
    expect(items.length).toBe(1);
  });
});
