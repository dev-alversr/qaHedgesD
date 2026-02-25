// src/pages/Listing.page.ts
import { Page } from '@playwright/test';
import { BasePage } from './Base.page';
import { getLocator } from '@locators/locatorRegistry';

export class ListingPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async search(query: string) {
    await this.fill('common.search.input', query);
    await this.click('common.search.submitBtn');
  }

  async getProductCards(): Promise<Array<any>> {
    const selector = getLocator('components.productCard.root');
    return this.page.locator(selector).all();
  }

  async clickProductAt(index: number) {
    const cardRoot = getLocator('components.productCard.root');
    await this.page.locator(cardRoot).nth(index).click();
  }
}