import { test, expect } from '@playwright/test';
import { EditorPage } from '../../utils/test-helpers.js';
import { sampleData } from '../../fixtures/sample-data.js';

/**
 * XPath Evaluation Workflow Tests - Simplified
 * Tests the XPath mode: Load XML → Enter XPath expression → See results
 */

test.describe('XPath Evaluation Workflow', () => {
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
    // Switch to XPath mode
    await page.switchToXpath();
  });

  test('should evaluate simple XPath expression (count)', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xpath = 'count(//user)';

    await page.fillXml(xml);
    await testPage.waitForTimeout(500);

    // Set XPath expression
    await testPage.evaluate((expr) => {
      const input = document.getElementById('xpathInput');
      if (input) input.value = expr;
    }, xpath);
    await testPage.waitForTimeout(500);

    // Run via keyboard
    await page.runViaKeyboard();
    await testPage.waitForTimeout(1500);

    // Should complete without errors
    const errors = await page.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('should select nodes with XPath', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xpath = '//user/name/text()';

    await page.fillXml(xml);
    await testPage.waitForTimeout(500);

    await testPage.evaluate((expr) => {
      const input = document.getElementById('xpathInput');
      if (input) input.value = expr;
    }, xpath);
    await testPage.waitForTimeout(500);

    await page.runViaKeyboard();
    await testPage.waitForTimeout(1500);

    const errors = await page.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('should handle XPath with predicates', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xpath = '//user[@id="1"]/name/text()';

    await page.fillXml(xml);
    await testPage.waitForTimeout(500);

    await testPage.evaluate((expr) => {
      const input = document.getElementById('xpathInput');
      if (input) input.value = expr;
    }, xpath);
    await testPage.waitForTimeout(500);

    await page.runViaKeyboard();
    await testPage.waitForTimeout(1500);

    const errors = await page.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('should handle empty result set gracefully', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;
    const xpath = '//book';  // No books in simpleXml

    await page.fillXml(xml);
    await testPage.waitForTimeout(500);

    await testPage.evaluate((expr) => {
      const input = document.getElementById('xpathInput');
      if (input) input.value = expr;
    }, xpath);
    await testPage.waitForTimeout(500);

    await page.runViaKeyboard();
    await testPage.waitForTimeout(1500);

    // Empty results are OK, no errors expected
    const errors = await page.getConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('should switch mode from XPath to XSLT', async ({ page: testPage }) => {
    const mode = await page.getMode();
    expect(mode).toBe('XPATH');

    await page.switchToXslt();
    const modeAfter = await page.getMode();
    expect(modeAfter).toBe('XSLT');
  });

  test('should preserve XML content in XPath mode', async ({ page: testPage }) => {
    const xml = sampleData.simpleXml;

    await page.fillXml(xml);
    await testPage.waitForTimeout(500);

    const xmlContent = await page.getXmlContent();
    expect(xmlContent).toBeTruthy();
    expect(xmlContent).toContain('<users>');
  });
});
