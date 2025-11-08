import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('Full User Workflow', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('complete workflow: create, edit, complete, filter, delete', async () => {
    // 1. Create multiple tasks
    const tasks = [
      'Buy groceries from store',
      'Check https://github.com for updates',
      'Write documentation'
    ];

    for (const task of tasks) {
      await window.click('.add-btn');
      await window.waitForSelector('#form-container[style*="display: block"]');
      await window.fill('textarea[placeholder="buy milk"]', task);
      await window.click('.save-btn');
      await window.waitForSelector('#form-container[style*="display: none"]');
    }

    await waitForTaskCount(window, 3);

    // 2. Verify URL was auto-linked
    const links = await window.locator('.item-content a').all();
    expect(links.length).toBeGreaterThan(0);

    // 3. Edit a task
    await window.locator('.item').nth(1).dblclick();
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Check GitHub and GitLab for updates');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Verify edit
    const taskTexts = await window.locator('.item-content').allTextContents();
    expect(taskTexts.join(' ')).toContain('GitLab');

    // 4. Complete a task
    const doneButtons = await window.locator('.done-btn').all();
    await doneButtons[0].click();
    await waitForTaskCount(window, 2);

    // 5. Verify total count
    let countText = await window.textContent('.count');
    expect(countText).toContain('3 total items');

    // 6. Switch to completed view
    await window.click('text=show completed items');
    await waitForTaskCount(window, 1);

    // 7. Switch back to open view
    await window.click('text=show open items');
    await waitForTaskCount(window, 2);

    // 8. Delete a task
    const deleteButtons = await window.locator('.delete-btn').all();
    await deleteButtons[0].click();
    await waitForTaskCount(window, 1);

    // 9. Verify final count (2 total: 1 open, 1 completed)
    countText = await window.textContent('.count');
    expect(countText).toContain('2 total items');
  });

  test('date display shows current date', async () => {
    // Get the displayed date
    const dateElement = await window.locator('.today');
    await expect(dateElement).toBeVisible();

    const dateText = await dateElement.textContent();

    // Verify it contains day name and date
    expect(dateText).toMatch(/\w+day/); // Should contain a day name like Monday, Tuesday, etc.
    expect(dateText).toMatch(/\d+/); // Should contain a number (day)
  });

  test('modal can be controlled with keyboard', async () => {
    // Open with click
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');

    // Type task name
    await window.type('textarea[placeholder="buy milk"]', 'Keyboard task');

    // Close with Escape
    await window.press('body', 'Escape');
    await window.waitForSelector('#form-container[style*="display: none"]');

    // Verify task was not created (cancelled)
    const items = await window.locator('.item').all();
    expect(items).toHaveLength(0);
  });
});
