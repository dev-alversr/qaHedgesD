import { expect } from '@playwright/test';
import { calculateSubtotal, LineForSubtotal } from '@utils/calculators/subtotal';

export type PricingLine = {
  name?: string;
  unitPrice: number;
  qty: number;
  lineSubtotal?: number; // optional if page doesn't show it
};

export type PricingSummary = {
  subtotalExDelivery?: number;
  discount?: number;
  deliveryFee?: number;
  grandTotal?: number;
};

type Options = {
  decimalPlaces?: number;      // default 2
  tolerance?: number;          // default 0.01
  roundingStrategy?: 'line_then_sum' | 'sum_then_round'; // default line_then_sum
};

function round(n: number, dp: number): number {
  return Number(n.toFixed(dp));
}

function approxEqual(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Validates line subtotal = unitPrice * qty (rounded).
 * Use this for cart line items and checkout summary lines.
 */
export function expectLineSubtotalValid(line: PricingLine, opts: Options = {}): void {
  const dp = opts.decimalPlaces ?? 2;
  const tol = opts.tolerance ?? 0.01;

  expect(line.qty, `Quantity should be >= 1 for line "${line.name ?? ''}"`).toBeGreaterThanOrEqual(1);
  expect(line.unitPrice, `Unit price should be > 0 for line "${line.name ?? ''}"`).toBeGreaterThan(0);

  const expected = round(line.unitPrice * line.qty, dp);

  if (typeof line.lineSubtotal === 'number') {
    expect(
      approxEqual(line.lineSubtotal, expected, tol),
      `Line subtotal mismatch for "${line.name ?? ''}": expected ${expected}, got ${line.lineSubtotal}`
    ).toBeTruthy();
  }
}

/**
 * Validates subtotal == Σ (unitPrice * qty) using calculator.
 * Use when you have multiple line items and a displayed subtotal.
 */
export function expectSubtotalMatchesLines(
  lines: PricingLine[],
  displayedSubtotal: number,
  opts: Options = {}
): void {
  const dp = opts.decimalPlaces ?? 2;
  const tol = opts.tolerance ?? 0.01;

  expect(lines.length, 'Expected at least one cart line item').toBeGreaterThan(0);
  expect(displayedSubtotal, 'Displayed subtotal should be > 0').toBeGreaterThan(0);

  const calcLines: LineForSubtotal[] = lines.map(l => ({ unitPrice: l.unitPrice, qty: l.qty }));
  const computed = calculateSubtotal(calcLines, dp);

  expect(
    approxEqual(displayedSubtotal, computed, tol),
    `Subtotal mismatch: expected ${computed}, got ${displayedSubtotal}`
  ).toBeTruthy();
}

/**
 * Optional: sanity checks on summary numbers (non-negative, ordering)
 * This avoids false positives while still being black-box safe.
 */
export function expectSummarySane(summary: PricingSummary): void {
  if (typeof summary.subtotalExDelivery === 'number') {
    expect(summary.subtotalExDelivery, 'Subtotal (ex delivery) should be >= 0').toBeGreaterThanOrEqual(0);
  }
  if (typeof summary.discount === 'number') {
    expect(summary.discount, 'Discount should be >= 0 (stored as positive amount)').toBeGreaterThanOrEqual(0);
  }
  if (typeof summary.deliveryFee === 'number') {
    expect(summary.deliveryFee, 'Delivery fee should be >= 0').toBeGreaterThanOrEqual(0);
  }
  if (typeof summary.grandTotal === 'number') {
    expect(summary.grandTotal, 'Grand total should be >= 0').toBeGreaterThanOrEqual(0);
  }
}

/**
 * Validates that moving through the journey doesn't change pricing unexpectedly.
 * Compare two snapshots of the same item across screens (PDP->cart, cart->checkout).
 */
export function expectPriceStable(
  a: { name?: string; unitPrice?: number; qty?: number; lineSubtotal?: number },
  b: { name?: string; unitPrice?: number; qty?: number; lineSubtotal?: number },
  opts: Options = {}
): void {
  const tol = opts.tolerance ?? 0.01;

  if (a.name && b.name) {
    expect(b.name, 'Item name should remain consistent across pages').toContain(a.name);
  }
  if (typeof a.unitPrice === 'number' && typeof b.unitPrice === 'number') {
    expect(
      approxEqual(a.unitPrice, b.unitPrice, tol),
      `Unit price changed unexpectedly: ${a.unitPrice} -> ${b.unitPrice}`
    ).toBeTruthy();
  }
  if (typeof a.qty === 'number' && typeof b.qty === 'number') {
    expect(b.qty, 'Quantity should remain consistent across pages').toBe(a.qty);
  }
  if (typeof a.lineSubtotal === 'number' && typeof b.lineSubtotal === 'number') {
    expect(
      approxEqual(a.lineSubtotal, b.lineSubtotal, tol),
      `Line subtotal changed unexpectedly: ${a.lineSubtotal} -> ${b.lineSubtotal}`
    ).toBeTruthy();
  }
}