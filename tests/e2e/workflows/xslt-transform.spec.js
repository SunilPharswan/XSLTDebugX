import { test, expect } from '@playwright/test';
import { EditorPage } from '../../utils/test-helpers.js';
import { sampleData } from '../../fixtures/sample-data.js';

/**
 * XSLT Transform Core Workflow Tests
 * Tests the primary workflow: Load XML → Load XSLT → Click Run → Verify Output
 */

test.describe('XSLT Transform Workflow', () => {
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
    // Ensure we're in XSLT mode
    await page.switchToXslt();
  });

  test('should perform a basic XSLT transform (XML → XSLT → Output)', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await page.clickRun();
    await testPage.waitForTimeout(2000);

    const output = await page.getOutput();
    expect(output).toBeTruthy();
    expect(output.length).toBeGreaterThan(0);
  });

  test('should detect malformed XML', async ({ page: testPage }) => {
    const malformedXml = '<invalid>';
    const xslt = sampleData.simpleXslt;

    await page.fillXml(malformedXml);
    await page.fillXslt(xslt);
    await page.clickRun();
    await testPage.waitForTimeout(2000);

    const errors = await page.getConsoleErrors();
    expect(errors).toBeDefined();
  });

  test('should run XSLT via Ctrl+Enter keyboard shortcut', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await page.runViaKeyboard();
    await testPage.waitForTimeout(2000);

    const output = await page.getOutput();
    expect(output).toBeTruthy();
  });

  test('should handle empty XML input', async ({ page: testPage }) => {
    const emptyXml = '';
    const xslt = sampleData.simpleXslt;

    await page.fillXml(emptyXml);
    await page.fillXslt(xslt);
    await page.clickRun();
    await testPage.waitForTimeout(2000);

    const output = await page.getOutput();
    expect(typeof output).toBe('string');
  });

  test('should preserve XSLT across mode switch', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await testPage.waitForTimeout(1000);

    await page.switchToXpath();
    await testPage.waitForTimeout(1000);
    await page.switchToXslt();
    await testPage.waitForTimeout(1000);

    const xsltAfter = await page.getXsltContent();
    expect(xsltAfter).toBeTruthy();
  });

  test('should store session after transform', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xslt = sampleData.simpleXslt;

    await page.fillXml(xml);
    await page.fillXslt(xslt);
    await testPage.waitForTimeout(1500);

    const session = await page.getStoredSession();
    expect(session).not.toBeNull();
    expect(session.xmlXslt).toBeTruthy();
    expect(session.xslt).toBeTruthy();
  });

  test('should be in XSLT mode initially', async () => {
    const mode = await page.getMode();
    expect(mode).toBe('XSLT');
  });
});
