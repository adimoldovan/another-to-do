import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, clearDatabase, waitForTaskCount } from './helpers/electron.js';

test.describe('URL Linking', () => {
  let electronApp, window;

  test.beforeEach(async () => {
    ({ electronApp, window } = await launchElectronApp());
    await clearDatabase(window);
  });

  test.afterEach(async () => {
    await closeElectronApp(electronApp);
  });

  test('should auto-link https URLs', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Check https://google.com for info');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Verify link is created
    const link = await window.locator('.item-content a').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('https://google.com');
  });

  test('should auto-link www URLs', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Visit www.example.com');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Verify link is created
    const link = await window.locator('.item-content a').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBe('www.example.com');
  });

  test('should auto-link multiple URLs in one task', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Check https://google.com and https://github.com');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Verify both links are created
    const links = await window.locator('.item-content a').all();
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  test('should display URL host in task-urls section', async () => {
    await window.click('.add-btn');
    await window.waitForSelector('#form-container[style*="display: block"]');
    await window.fill('textarea[placeholder="buy milk"]', 'Visit https://www.github.com/user/repo');
    await window.click('.save-btn');
    await window.waitForSelector('#form-container[style*="display: none"]');
    await waitForTaskCount(window, 1);

    // Check URL appears in task-urls section
    const urlSection = await window.locator('.task-urls a').first();
    await expect(urlSection).toBeVisible();
    const urlText = await urlSection.textContent();
    expect(urlText).toContain('github.com');
  });
});
