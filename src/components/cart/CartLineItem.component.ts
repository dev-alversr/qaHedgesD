import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';
import { PriceComponent } from '@components/product/Price.component';

export type CartLineItemSnapshot = {
  name: string;
  unitPrice: number;
  qty: number;
  lineSubtotal: number;
};

export class CartLineItemComponent {
  private readonly page: Page;
  private readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  name(): Locator {
    return this.root.locator(getLocator('cartLineItem.name'));
  }

  unitPrice(): Locator {
    return this.root.locator(getLocator('cartLineItem.unitPrice'));
  }

  qtyInput(): Locator {
    return this.root.locator(getLocator('cartLineItem.qtyInput'));
  }

  lineSubtotal(): Locator {
    return this.root.locator(getLocator('cartLineItem.lineSubtotal'));
  }

  removeBtn(): Locator {
    return this.root.locator(getLocator('cartLineItem.removeBtn'));
  }

  async snapshot(): Promise<CartLineItemSnapshot> {
    const name = (await this.name().innerText().catch(() => '')).trim();

    const unitPriceText = await this.unitPrice().first().innerText().catch(() => '');
    const lineSubtotalText = await this.lineSubtotal().first().innerText().catch(() => '');
    const qtyVal = await this.qtyInput().inputValue().catch(() => '0');

    const qty = Number.parseInt(qtyVal, 10);
    return {
      name,
      unitPrice: PriceComponent.parse(unitPriceText),
      qty: Number.isNaN(qty) ? 0 : qty,
      lineSubtotal: PriceComponent.parse(lineSubtotalText)
    };
  }

  async setQty(qty: number): Promise<void> {
    await this.qtyInput().fill(String(qty));
    await this.qtyInput().blur().catch(() => {});
  }

  async remove(): Promise<void> {
    await this.removeBtn().click();
  }
}