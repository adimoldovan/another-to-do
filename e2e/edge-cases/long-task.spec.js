import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from '../helpers/electron.js';

test.describe('Edge Case: Long Task Name', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should handle very long task names', async () => {
    const longText = 'A'.repeat(500);

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', longText);
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('AAA'); // Verify it contains the repeated text
  });

  test('should handle task with multiple lines', async () => {
    const multilineText = 'Line 1\\nLine 2\\nLine 3';

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', multilineText);
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
  });
});
