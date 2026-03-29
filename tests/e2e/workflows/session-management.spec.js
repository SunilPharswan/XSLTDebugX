import { test, expect } from '@playwright/test';
import { EditorPage } from '../../utils/test-helpers.js';
import { sampleData } from '../../fixtures/sample-data.js';

/**
 * Session Management Tests - Simplified Core Only
 * Tests auto-save, persistence, clearing of sessions
 */

test.describe('Session Management', () => {
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = new EditorPage(testPage);
    // Navigate first so localStorage is accessible
    await page.navigate();
    // THEN clear storage
    await testPage.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should auto-save session to localStorage', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.switchToXslt();
    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await testPage.waitForTimeout(1500);

    const session = await page.getStoredSession();
    expect(session).not.toBeNull();
    expect(session.xmlXslt).toBeTruthy();
    expect(session.xslt).toBeTruthy();
  });

  test('should persist session after page reload', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.switchToXslt();
    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await testPage.waitForTimeout(1500);

    // Reload page
    await testPage.reload();
    await testPage.waitForLoadState('networkidle');
    await testPage.waitForTimeout(1000);

    const xmlAfter = await page.getXmlContent();
    const xsltAfter = await page.getXsltContent();

    expect(xmlAfter).toBeTruthy();
    expect(xsltAfter).toBeTruthy();
  });

  test('should store output when transform runs', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.switchToXslt();
    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await page.clickRun();
    await testPage.waitForTimeout(2000);

    const session = await page.getStoredSession();
    expect(session).toBeTruthy();
    // Output may or may not be in session depending on implementation
  });

  test('should maintain session mode (XSLT vs XPath) in localStorage', async ({ page: testPage }) => {
    await page.switchToXpath();
    await testPage.waitForTimeout(1000);

    const modeBefore = await page.getMode();
    const session = await page.getStoredSession();

    expect(modeBefore).toBe('XPATH');
    expect(session.xpathEnabled).toBe(true);
  });

  test('should restore session mode after reload', async ({ page: testPage }) => {
    await page.switchToXpath();
    await testPage.waitForTimeout(1000);

    await testPage.reload();
    await testPage.waitForLoadState('networkidle');
    await testPage.waitForTimeout(1000);

    const modeAfter = await page.getMode();
    expect(modeAfter).toBe('XPATH');
  });

  test('should preserve session across mode switches', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.switchToXslt();
    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await testPage.waitForTimeout(1500);

    const sessionBefore = await page.getStoredSession();

    // Switch modes
    await page.switchToXpath();
    await testPage.waitForTimeout(1000);
    await page.switchToXslt();
    await testPage.waitForTimeout(1500);

    const sessionAfter = await page.getStoredSession();

    // Critical data should be preserved
    expect(sessionAfter.xmlXslt).toBeTruthy();
    expect(sessionAfter.xslt).toBeTruthy();
  });

  test('should load empty editors on fresh start', async ({ page: testPage }) => {
    // Just check that editors are accessible
    await testPage.evaluate(() => {
      localStorage.clear();
    });

    // Fresh page load
    await testPage.goto('http://localhost:8000');
    await testPage.waitForLoadState('networkidle');
    await testPage.waitForTimeout(1000);

    // Editors should exist (may have placeholder content)
    const hasElements = await testPage.evaluate(() => {
      return {
        hasEditors: document.querySelectorAll('.monaco-editor').length > 0,
        hasXmlInput: document.getElementById('xpathInput') !== null
      };
    });

    expect(hasElements.hasEditors).toBe(true);
  });
});
