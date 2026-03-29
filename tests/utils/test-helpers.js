import { expect } from '@playwright/test';

/**
 * Page Object Model for XSLTDebugX
 * Provides high-level methods for interacting with the application
 */
export class EditorPage {
  constructor(page) {
    this.page = page;
    // Selectors (from actual index.html)
    this.runButton = 'button#runBtn';
    this.xpathToggle = 'button#modeBtnXpath';
    this.xsltToggle = 'button#modeBtnXslt';
    this.shareButton = 'button#shareBtn';
    this.examplesButton = 'button#exBtn';
    this.clearSessionButton = 'button#clearSessionBtn';
    this.themeToggle = 'button#themeToggle';
  }

  /**
   * Navigate to the application
   */
  async navigate() {
    await this.page.goto('http://localhost:8000');
    await this.page.waitForLoadState('networkidle');
    // Wait for Monaco Editor to initialize
    await this.page.waitForSelector('.monaco-editor', { timeout: 15000 });
    // Extra wait for JS initialization
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get XML editor content
   */
  async getXmlContent() {
    return await this.page.evaluate(() => {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      return editors[0]?.getValue?.() || '';
    });
  }

  /**
   * Fill XML content via Monaco API
   */
  async fillXml(content) {
    await this.page.evaluate((xml) => {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      if (editors[0]) {
        editors[0].setValue(xml);
      }
    }, content);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get XSLT editor content
   */
  async getXsltContent() {
    return await this.page.evaluate(() => {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      return editors[1]?.getValue?.() || '';
    });
  }

  /**
   * Fill XSLT content via Monaco API
   */
  async fillXslt(content) {
    await this.page.evaluate((xslt) => {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      if (editors[1]) {
        editors[1].setValue(xslt);
      }
    }, content);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get output editor content
   */
  async getOutput() {
    return await this.page.evaluate(() => {
      const editors = window.monaco?.editor?.getEditors?.() || [];
      return editors[2]?.getValue?.() || '';
    });
  }

  /**
   * Click the Run button
   */
  async clickRun() {
    await this.page.click(this.runButton);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get current mode (XSLT or XPATH)
   */
  async getMode() {
    return await this.page.evaluate(() => {
      // isXpath is a GETTER property, not a method
      const isXpath = window.modeManager?.isXpath;
      return isXpath ? 'XPATH' : 'XSLT';
    });
  }

  /**
   * Switch to XSLT mode
   */
  async switchToXslt() {
    const mode = await this.getMode();
    if (mode === 'XSLT') return;
    await this.page.click(this.xsltToggle);
    // Wait for mode change animation and DOM updates
    await this.page.waitForTimeout(1500);
  }

  /**
   * Switch to XPath mode
   */
  async switchToXpath() {
    const mode = await this.getMode();
    if (mode === 'XPATH') return;
    await this.page.click(this.xpathToggle);
    // Wait for mode change animation and DOM updates
    await this.page.waitForTimeout(1500);
  }

  /**
   * Get console messages
   */
  async getConsoleMessages() {
    return await this.page.evaluate(() => {
      if (!window.clog?.getMessages) return [];
      try {
        return window.clog.getMessages?.() || [];
      } catch {
        return [];
      }
    });
  }

  /**
   * Clear console
   */
  async clearConsole() {
    return await this.page.evaluate(() => {
      window.clog?.clear?.();
    });
  }

  /**
   * Get all console errors
   */
  async getConsoleErrors() {
    const messages = await this.getConsoleMessages();
    return messages.filter(m => m.type === 'error' || m.type === 'warn');
  }

  /**
   * Clear session (localStorage)
   */
  async clearSession() {
    const clearBtn = this.page.locator(this.clearSessionButton);
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      // Handle confirmation dialog
      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK")');
      if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmBtn.first().click();
      }
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Open share modal
   */
  async openShareModal() {
    await this.page.click(this.shareButton);
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  /**
   * Get the share URL from modal
   */
  async getShareUrl() {
    const urlInput = this.page.locator('input[readonly]');
    return await urlInput.inputValue().catch(() => '');
  }

  /**
   * Open examples modal
   */
  async openExamplesModal() {
    await this.page.click(this.examplesButton);
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
  }

  /**
   * Toggle theme
   */
  async toggleTheme() {
    await this.page.click(this.themeToggle);
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current theme
   */
  async getTheme() {
    return await this.page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') ||
             document.body.getAttribute('class') || 'light';
    });
  }

  /**
   * Clear browser storage
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Get stored session from localStorage
   */
  async getStoredSession() {
    return await this.page.evaluate(() => {
      const session = localStorage.getItem('xdebugx-session-v1');
      return session ? JSON.parse(session) : null;
    });
  }

  /**
   * Check if errors are present
   */
  async hasErrors() {
    const errorBadge = this.page.locator('.status-error');
    return await errorBadge.isVisible().catch(() => false);
  }

  /**
   * Get error count
   */
  async getErrorCount() {
    const badge = this.page.locator('.status-error');
    if (!await badge.isVisible().catch(() => false)) return 0;
    const text = await badge.textContent().catch(() => '0');
    return parseInt(text.replace(/\D/g, '')) || 0;
  }

  /**
   * Get mode indicator
   */
  async getModeIndicator() {
    return await this.page.evaluate(() => {
      // isXpath is a GETTER property, not a method
      const mode = window.modeManager?.isXpath ? 'ƒx' : 'XSLT';
      return mode;
    });
  }

  /**
   * Run XSLT via Ctrl+Enter keyboard shortcut
   */
  async runViaKeyboard() {
    await this.page.locator('.monaco-editor').first().click();
    await this.page.keyboard.press('Control+Enter');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for output to be generated
   */
  async waitForOutput() {
    await this.page.waitForTimeout(2000);
  }
}

/**
 * Utility function to wait for a condition
 */
export async function waitForCondition(fn, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Timeout waiting for condition');
}

/**
 * Generate a share URL with Base64 encoding
 */
export function mockShareUrl(xml, xslt, mode = 'XSLT') {
  const session = {
    xml,
    xslt,
    output: '',
    mode,
    headers: [],
    properties: [],
    xpathEnabled: mode === 'XPATH'
  };
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  return `http://localhost:8000/?s=${encoded}`;
}
