// src/pages/Product.page.ts
import { BasePage } from './Base.page';
import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class ProductPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async getTitle(): Promise<string> {
    return this.page.textContent(getLocator('pages.product.title'));
  }

  async getUnitPrice(): Promise<number> {
    const text = await this.page.textContent(getLocator('components.price.unit'));
    return parseFloat(text?.replace(/[^\d.]/g, '') ?? '0');
  }

  async setQuantity(qty: number) {
    await this.page.fill(getLocator('components.quantityStepper.input'), qty.toString());
  }

  async addToCart() {
    await this.click('components.productCard.addToCartBtn');
  }

  async isOutOfStock(): Promise<boolean> {
    return this.isVisible('components.stockBadge.outOfStock');
  }
}