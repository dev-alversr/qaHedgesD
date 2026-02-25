import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class MiniCartComponent {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  panelTitle(): Locator {
    return this.page.locator(getLocator('miniCart.panelTitle'));
  }

  closeBtn(): Locator {
    return this.page.locator(getLocator('miniCart.closeBtn'));
  }

  continueToCheckoutBtn(): Locator {
    return this.page.locator(getLocator('miniCart.continueToCheckout'));
  }

  viewEditBasketLink(): Locator {
    return this.page.locator(getLocator('miniCart.viewEditBasket'));
  }

  saveBasketForLaterLink(): Locator {
    return this.page.locator(getLocator('miniCart.saveBasketForLater'));
  }

  async isOpen(): Promise<boolean> {
    return this.panelTitle().first().isVisible().catch(() => false);
  }

  async close(): Promise<void> {
    const open = await this.isOpen();
    if (!open) return;

    const closeVisible = await this.closeBtn().first().isVisible().catch(() => false);
    if (closeVisible) {
      await this.closeBtn().click();
      return;
    }

    // Fallback: ESC
    await this.page.keyboard.press('Escape');
  }

  async continueToCheckout(): Promise<void> {
    await this.continueToCheckoutBtn().click();
  }

  async viewAndEditBasket(): Promise<void> {
    await this.viewEditBasketLink().click();
  }

  async openSaveBasketForLater(): Promise<void> {
    await this.saveBasketForLaterLink().click();
  }
}