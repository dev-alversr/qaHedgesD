import { expect } from '@playwright/test';

export type CartIdentity = {
  name?: string;
  sku?: string;
  url?: string;
};

export type CartLineMinimal = {
  name: string;
  qty: number;
  unitPrice: number;
  lineSubtotal: number;
};

/**
 * Checks that a cart line item has the minimum data you need for reliable validation.
 */
export function expectCartLineHasCoreFields(line: CartLineMinimal): void {
  expect(line.name, 'Cart line name should not be empty').toBeTruthy();
  expect(line.qty, 'Cart quantity should be >= 1').toBeGreaterThanOrEqual(1);
  expect(line.unitPrice, 'Cart unit price should be > 0').toBeGreaterThan(0);
  expect(line.lineSubtotal, 'Cart line subtotal should be > 0').toBeGreaterThan(0);
}

/**
 * Identity consistency check:
 * Ensures the item you added is the one shown in cart/checkout (black-box safe).
 * Uses "contains" for name because sites sometimes append size/variant text.
 */
export function expectSameItem(expected: CartIdentity, actual: CartIdentity): void {
  if (expected.name) {
    expect(actual.name, 'Item name should exist on destination page').toBeTruthy();
    expect(
      actual.name?.toLowerCase(),
      `Expected item name to contain "${expected.name}"`
    ).toContain(expected.name.toLowerCase());
  }

  // SKU is optional in black-box mode (often not visible)
  if (expected.sku && actual.sku) {
    expect(actual.sku, 'SKU should match').toBe(expected.sku);
  }

  // URL check is optional; only if you captured it
  if (expected.url && actual.url) {
    expect(actual.url, 'Product URL should match or be consistent').toContain(expected.url);
  }
}

/**
 * Cart count sanity.
 */
export function expectCartNotEmpty(lineCount: number): void {
  expect(lineCount, 'Cart should have at least 1 line item').toBeGreaterThan(0);
}