import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from '../helpers/electron.js';

test.describe('Edge Case: Empty Task', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should not create task with empty name', async () => {
    // Open modal
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Try to submit without entering text
    await window.click('.save-btn');

    // Modal should close but no task should be created
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 0);
  });

  test('should not create task with only whitespace', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Enter only whitespace
    await window.fill('#task-input', '   \\n\\t   ');
    await window.click('.save-btn');

    // Should not create task
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 0);
  });
});
