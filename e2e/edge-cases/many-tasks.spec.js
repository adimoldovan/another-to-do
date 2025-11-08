import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase } from '../helpers/electron.js';

test.describe('Edge Case: Many Tasks', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should handle 50+ tasks without performance issues', async () => {
    const taskCount = 50;

    // Create tasks directly via database for speed
    await window.evaluate(async (count) => {
      const { db } = await import('./src/db.js');
      const tasks = [];
      for (let i = 0; i < count; i++) {
        tasks.push({
          name: `Task ${i + 1}`,
          priority: count - i,
          complete: 0,
        });
      }
      await db.tasks.bulkAdd(tasks);
    }, taskCount);

    // Wait for UI to render all tasks
    await window.waitForFunction(
      (expectedCount) => {
        const items = document.querySelectorAll('.item');
        return items.length === expectedCount;
      },
      taskCount,
      { timeout: 10000 }
    );

    // Verify count
    const items = await window.locator('.item').all();
    expect(items.length).toBe(taskCount);

    // Verify count display
    const countText = await window.textContent('.count');
    expect(countText).toContain(`${taskCount} total items`);
  });

  test('should scroll and render many tasks correctly', async () => {
    // Create 20 tasks for scrolling test
    await window.evaluate(async () => {
      const { db } = await import('./src/db.js');
      const tasks = [];
      for (let i = 0; i < 20; i++) {
        tasks.push({
          name: `Scrollable Task ${i + 1}`,
          priority: 20 - i,
          complete: 0,
        });
      }
      await db.tasks.bulkAdd(tasks);
    });

    await window.waitForFunction(
      () => document.querySelectorAll('.item').length === 20,
      { timeout: 5000 }
    );

    // Verify first and last tasks are in DOM
    const firstTask = await window.locator('.item').first().textContent();
    const lastTask = await window.locator('.item').last().textContent();

    expect(firstTask).toContain('Scrollable Task');
    expect(lastTask).toContain('Scrollable Task');
  });
});
