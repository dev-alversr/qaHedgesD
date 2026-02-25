import { Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { CartPage } from '@pages/Cart.page';
import { CheckoutPage } from '@pages/Checkout.page';

type Address = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  county?: string;
  postcode: string;
  phone: string;
  country?: string;
};

function readStandardAddress(): Address {
  const p = path.resolve('test-data/addresses.json');
  const raw = fs.readFileSync(p, 'utf-8');
  const data = JSON.parse(raw);
  const addr = data.uk_standard;
  if (!addr) throw new Error('[CheckoutFlow] Missing uk_standard in test-data/addresses.json');
  return addr as Address;
}

export class CheckoutFlow {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async proceedToCheckoutFromCart(): Promise<void> {
    const cartPage = new CartPage(this.page);
    // Best effort: your CartPage may later implement a method to click checkout
    await this.page.click('text=Continue To Checkout').catch(async () => {
      // fallback: try common button text variants
      await this.page.click('text=/Checkout/i');
    });
  }

  async fillShippingWithStandardAddress(): Promise<void> {
    const checkoutPage = new CheckoutPage(this.page);
    const addr = readStandardAddress();
    await checkoutPage.enterShippingAddress(addr);
  }

  /**
   * Snapshot cart item & totals before payment step (best effort).
   * Use this to assert item/price/subtotal consistency across cart->checkout.
   */
  async snapshotBeforePayment(): Promise<{ cartItem?: any; total?: number }> {
    const cartPage = new CartPage(this.page);
    const checkoutPage = new CheckoutPage(this.page);

    const cartItem = await cartPage.getItemDetails(0).catch(() => undefined);
    const total = await checkoutPage.getTotal().catch(() => undefined);

    return { cartItem, total };
  }
}