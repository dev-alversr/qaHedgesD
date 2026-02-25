import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';
import { PriceComponent } from './Price.component';

export class ProductCardComponent {
  private readonly page: Page;
  private readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  nameLink(): Locator {
    return this.root.locator(getLocator('productCard.nameLink'));
  }

  priceText(): Locator {
    return this.root.locator(getLocator('productCard.priceText'));
  }

  addToCartBtn(): Locator {
    return this.root.locator(getLocator('productCard.addToCartBtn'));
  }

  async getName(): Promise<string> {
    const text = await this.nameLink().innerText();
    return text.trim();
  }

  async getUnitPrice(): Promise<number> {
    const text = await this.priceText().first().innerText().catch(() => '');
    return PriceComponent.parse(text);
  }

  async openPdp(): Promise<void> {
    await this.nameLink().click();
  }

  async addToCart(): Promise<void> {
    await this.addToCartBtn().click();
  }
}