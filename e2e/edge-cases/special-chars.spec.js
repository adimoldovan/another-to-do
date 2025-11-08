import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from '../helpers/electron.js';

test.describe('Edge Case: Special Characters', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should handle emoji in task name', async () => {
    const emojiText = 'Buy groceries 🛒 and cook dinner 🍳';

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', emojiText);
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('groceries');
  });

  test('should handle special HTML characters', async () => {
    const htmlText = 'Task with <tags> & "quotes" and \' apostrophes';

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', htmlText);
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Task with');
  });

  test('should handle unicode characters', async () => {
    const unicodeText = 'Café ☕ résumé naïve 日本語';

    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', unicodeText);
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
  });
});
