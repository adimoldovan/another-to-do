import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase } from './helpers/electron.js';

test.describe('Modal Interactions', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should open modal when clicking add button', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    const textarea = await window.locator('textarea[placeholder="buy milk"]');
    await expect(textarea).toBeVisible();
  });

  test('should close modal when clicking close button', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    await window.click('.close');
    await window.waitForSelector('#form-container[style*="display: none"]');
  });

  test('should close modal when pressing Escape key', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    await window.press('body', 'Escape');
    await window.waitForSelector('#form-container[style*="display: none"]');
  });

  test('should clear textarea when opening for new task', async () => {
    // Create a task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'First task');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Open again for new task
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    const textareaValue = await window.inputValue('textarea[placeholder="buy milk"]');
    expect(textareaValue).toBe('');
  });

  test('should save task when clicking save button', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Test task');
    await window.click('.save-btn');

    // Modal should close
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Task should appear
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Test task');
  });
});
