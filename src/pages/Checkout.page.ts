// src/pages/Checkout.page.ts
import { BasePage } from './Base.page';
import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class CheckoutPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async enterShippingAddress(address: any) {
    await this.fill('pages.checkout.firstName', address.firstName);
    await this.fill('pages.checkout.lastName', address.lastName);
    await this.fill('pages.checkout.addressLine1', address.addressLine1);
    await this.fill('pages.checkout.city', address.city);
    await this.fill('pages.checkout.postcode', address.postcode);
    await this.fill('pages.checkout.phone', address.phone);
  }

  async chooseDeliveryOption(optionText: string) {
    await this.click(`pages.checkout.deliveryOption.${optionText}`);
  }

  async placeOrder() {
    await this.click('pages.checkout.placeOrderBtn');
  }

  async getTotal(): Promise<number> {
    const totalText = await this.page.textContent(getLocator('components.cartSummary.total'));
    return parseFloat(totalText?.replace(/[^\d.]/g, '') ?? '0');
  }
}