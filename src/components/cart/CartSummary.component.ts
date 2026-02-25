import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';
import { PriceComponent } from '@components/product/Price.component';

export type CartSummarySnapshot = {
  subtotalExDelivery?: number;
  discount?: number;
  deliveryFee?: number;
  grandTotal?: number;
};

export class CartSummaryComponent {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  discountValue(): Locator {
    return this.page.locator(getLocator('cartSummary.discountValue'));
  }

  subtotalExDeliveryValue(): Locator {
    return this.page.locator(getLocator('cartSummary.subtotalExDeliveryValue'));
  }

  deliveryFeeValue(): Locator {
    return this.page.locator(getLocator('cartSummary.deliveryFeeValue'));
  }

  grandTotalValue(): Locator {
    return this.page.locator(getLocator('cartSummary.grandTotalValue'));
  }

  private async readMoney(locator: Locator): Promise<number | undefined> {
    const visible = await locator.first().isVisible().catch(() => false);
    if (!visible) return undefined;
    const text = await locator.first().innerText().catch(() => '');
    const val = PriceComponent.parse(text);
    return val === 0 && !text.includes('0') && !text.includes('£') ? undefined : val;
  }

  async snapshot(): Promise<CartSummarySnapshot> {
    return {
      discount: await this.readMoney(this.discountValue()),
      subtotalExDelivery: await this.readMoney(this.subtotalExDeliveryValue()),
      deliveryFee: await this.readMoney(this.deliveryFeeValue()),
      grandTotal: await this.readMoney(this.grandTotalValue())
    };
  }
}