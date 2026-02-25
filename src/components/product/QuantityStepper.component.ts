import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class QuantityStepperComponent {
  private readonly page: Page;
  private readonly inputLocatorKey: string;

  constructor(page: Page, inputLocatorKey = 'product.qty.input') {
    this.page = page;
    this.inputLocatorKey = inputLocatorKey;
  }

  input(): Locator {
    return this.page.locator(getLocator(this.inputLocatorKey));
  }

  async set(qty: number): Promise<void> {
    await this.input().fill(String(qty));
    // Some sites update totals on blur
    await this.input().blur().catch(() => {});
  }

  async get(): Promise<number> {
    const val = await this.input().inputValue();
    const n = Number.parseInt(val, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  async increment(times = 1): Promise<void> {
    // If plus button exists on PDP, you can extend this later
    const current = await this.get();
    await this.set(current + times);
  }

  async decrement(times = 1): Promise<void> {
    const current = await this.get();
    await this.set(Math.max(0, current - times));
  }
}