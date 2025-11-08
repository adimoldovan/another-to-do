import { test, expect, waitForTaskCount } from './fixtures.js';

test.describe('Task Creation', () => {

  test('should create a new task', async ({ window }) => {
    // Click the add button
    await window.click('.add-btn');

    // Wait for modal to appear
    await window.waitForSelector('#form-container', { state: 'visible' });

    // Type task name
    await window.fill('textarea[placeholder="buy milk"]', 'Buy groceries');

    // Click save button
    await window.click('.save-btn');

    // Wait for modal to close
    await window.waitForSelector('#form-container', { state: 'hidden' });

    // Verify task appears in list
    await waitForTaskCount(window, 1);
    const taskText = await window.textContent('.item-content');
    expect(taskText).toContain('Buy groceries');
  });
});
