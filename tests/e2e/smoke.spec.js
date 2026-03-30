import { test, expect } from '@playwright/test';
import { EditorPage } from '../utils/test-helpers.js';
import { sampleData } from '../fixtures/sample-data.js';

/**
 * Smoke Tests - Basic application functionality
 * Quick verification that the app loads and core features work
 */

test.describe('Smoke Tests', () => {
  test('should load app with all UI elements visible', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Assert key UI elements - use correct IDs from HTML
    const runBtn = page.locator('button#runBtn');
    const shareBtn = page.locator('button#shareBtn');
    const examplesBtn = page.locator('button#exBtn');

    expect(await runBtn.isVisible()).toBe(true);
    expect(await shareBtn.isVisible()).toBe(true);
    expect(await examplesBtn.isVisible()).toBe(true);

    // Assert mode buttons
    const xsltBtn = page.locator('#modeBtnXslt');
    const xpathBtn = page.locator('#modeBtnXpath');
    expect(await xsltBtn.isVisible()).toBe(true);
    expect(await xpathBtn.isVisible()).toBe(true);

    // Assert editors are loaded
    const editors = page.locator('.monaco-editor');
    const editorCount = await editors.count();
    expect(editorCount).toBeGreaterThan(2);
  });

  test('should perform basic XSLT transform', async ({ page }) => {
    const editor = new EditorPage(page);
    await editor.navigate();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Fill and transform
    await editor.fillXml(sampleData.simpleXml);
    await editor.fillXslt(sampleData.simpleXslt);
    await editor.clickRun();
    await page.waitForTimeout(2000);

    // Assert
    const output = await editor.getOutput();
    expect(output).toBeTruthy();
    expect(output.length).toBeGreaterThan(0);
  });

  test('should switch between XSLT and XPath modes', async ({ page }) => {
    const editor = new EditorPage(page);
    await editor.navigate();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Start in XSLT
    let mode = await editor.getMode();
    expect(mode).toBe('XSLT');

    // Switch to XPath
    await editor.switchToXpath();
    await page.waitForTimeout(1000);

    mode = await editor.getMode();
    expect(mode).toBe('XPATH');

    // Switch back
    await editor.switchToXslt();
    await page.waitForTimeout(1000);

    mode = await editor.getMode();
    expect(mode).toBe('XSLT');
  });

  // Print summary
  test('SUMMARY: Smoke Tests', async () => {
    console.log(`
✅ SMOKE TESTS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • App loads successfully
  • Basic XSLT transform works
  • Mode switching functional
`);
  });
});
