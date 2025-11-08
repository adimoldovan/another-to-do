import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from '../helpers/electron.js';

test.describe('Edge Case: URL Variations', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should handle http URL', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', 'Check http://example.com');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const link = await window.locator('.item-content a').first();
    await expect(link).toBeVisible();
  });

  test('should handle URL with path and query params', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', 'Visit https://example.com/path?foo=bar&baz=qux');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const link = await window.locator('.item-content a').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toContain('foo=bar');
  });

  test('should handle www URL without protocol', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', 'Go to www.example.com');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const link = await window.locator('.item-content a').first();
    await expect(link).toBeVisible();
  });

  test('should handle multiple different URL formats in one task', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('#task-input', 'Check https://google.com and www.github.com and http://example.org');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');

    await waitForTaskCount(window, 1);
    const links = await window.locator('.item-content a').all();
    expect(links.length).toBeGreaterThanOrEqual(3);
  });
});
