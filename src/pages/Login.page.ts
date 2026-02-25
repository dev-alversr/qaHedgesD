// src/pages/Login.page.ts
import { BasePage } from './Base.page';
import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class LoginPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async login(email: string, password: string) {
    await this.fill('pages.login.emailInput', email);
    await this.fill('pages.login.passwordInput', password);
    await this.click('pages.login.submitBtn');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.page.textContent(getLocator('pages.login.errorMessage'));
  }
}