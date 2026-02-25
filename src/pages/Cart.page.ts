// src/pages/Cart.page.ts
import { BasePage } from './Base.page';
import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class CartPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async getLineItems() {
    const itemRoot = getLocator('components.cartLineItem.root');
    return this.page.locator(itemRoot).all();
  }

  /*async getItemDetails(index: number) {
    const rootLocator = this.page.locator(getLocator('components.cartLineItem.root')).nth(index);
    const name = await rootLocator.textContent(getLocator('components.cartLineItem.name'));
    const unitPriceText = await rootLocator.textContent(getLocator('components.cartLineItem.unitPrice'));
    const qtyText = await rootLocator.inputValue(getLocator('components.cartLineItem.qtyInput'));
    const lineSubtotalText = await rootLocator.textContent(getLocator('components.cartLineItem.lineSubtotal'));

    return {
      name: name?.trim(),
      unitPrice: parseFloat((unitPriceText ?? '').replace(/[^\d.]/g, '')),
      qty: parseInt(qtyText ?? '0'),
      subtotal: parseFloat((lineSubtotalText ?? '').replace(/[^\d.]/g, ''))
    };
  }*/
  async getItemDetails(index: number) {
    const rootLocator = this.page.locator(getLocator('cartLineItem.root')).nth(index);

    const nameRaw = await rootLocator.locator(getLocator('cartLineItem.name')).textContent();
    const unitPriceRaw = await rootLocator.locator(getLocator('cartLineItem.unitPrice')).textContent();
    const qtyRaw = await rootLocator.locator(getLocator('cartLineItem.qtyInput')).inputValue();
    const subtotalRaw = await rootLocator.locator(getLocator('cartLineItem.lineSubtotal')).textContent();

    return {
      name: nameRaw?.trim(), // still optional -> guard in test OR normalize to ''
      unitPrice: parseFloat((unitPriceRaw ?? '').replace(/[^\d.]/g, '')) || 0,
      qty: parseInt(qtyRaw ?? '0', 10) || 0,
      subtotal: parseFloat((subtotalRaw ?? '').replace(/[^\d.]/g, '')) || 0
    };
  }

  async removeItem(index: number) {
    await this.page.locator(getLocator('components.cartLineItem.removeBtn')).nth(index).click();
  }

  async getCartSubtotal(): Promise<number> {
    const text = await this.page.textContent(getLocator('components.cartSummary.subtotal'));
    return parseFloat(text?.replace(/[^\d.]/g, '') ?? '0');
  }

  //additional fix
    async updateQuantity(index: number, qty: number): Promise<void> {
    // Find the line item root
    const itemRootSel = getLocator('cartLineItem.root');
    const item = this.page.locator(itemRootSel).nth(index);

    // Find qty input within the line item
    const qtySel = getLocator('cartLineItem.qtyInput');
    const qtyInput = item.locator(qtySel);

    await qtyInput.fill(String(qty));
    await qtyInput.blur().catch(() => {});

    // Best-effort wait for recalculation:
    // If the UI updates totals asynchronously, this gives it a moment.
    await this.page.waitForTimeout(500);
  }
}