// src/pages/Base.page.ts
import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async click(locatorKey: string) {
    const selector = getLocator(locatorKey);
    await this.page.click(selector);
  }

  async fill(locatorKey: string, value: string) {
    const selector = getLocator(locatorKey);
    await this.page.fill(selector, value);
  }

  async isVisible(locatorKey: string): Promise<boolean> {
    const selector = getLocator(locatorKey);
    return this.page.isVisible(selector);
  }
}