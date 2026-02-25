// src/locators/locatorRegistry.ts
import common from './common.locators.json';

// pages
import listing from './pages/listing.locators.json';
import product from './pages/product.locators.json';
import cart from './pages/cart.locators.json';
import checkout from './pages/checkout.locators.json';
import login from './pages/login.locators.json';

// components
import header from './components/header.locators.json';
import productCard from './components/productCard.locators.json';
import miniCart from './components/miniCart.locators.json';
import cartLineItem from './components/cartLineItem.locators.json';
import cartSummary from './components/cartSummary.locators.json';
import cookieBanner from './components/cookieBanner.locators.json';

type LocatorEntry = {
  primary: string;
  fallbacks?: string[];
};

type LocatorNode = LocatorEntry | Record<string, any>;

const packs: Record<string, any> = {
  // common
  common,

  // pages
  listing,
  product,
  cart,
  checkout,
  login,

  // components
  header,
  productCard,
  miniCart,
  cartLineItem,
  cartSummary,
  cookieBanner
};

/**
 * Resolve a dot-path key like:
 *  - "common.buttons.continue"
 *  - "product.price"
 *  - "header.search.input"
 *
 * Strategy:
 * 1) First token selects the pack name (e.g., "common", "product", "header")
 * 2) Remaining tokens traverse the JSON object
 */
function resolveNode(key: string): LocatorNode | undefined {
  if (!key || typeof key !== 'string') return undefined;

  const parts = key.split('.').map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return undefined;

  const packName = parts[0];
  const pack = packs[packName];
  if (!pack) return undefined;

  let node: any = pack;
  for (let i = 1; i < parts.length; i++) {
    node = node?.[parts[i]];
    if (node == null) return undefined;
  }
  return node as LocatorNode;
}

function isLocatorEntry(node: LocatorNode): node is LocatorEntry {
  return !!node && typeof (node as any).primary === 'string';
}

/**
 * Returns only the PRIMARY selector string.
 * Use this when you want deterministic behavior.
 */
export function getLocator(key: string): string {
  const node = resolveNode(key);
  if (!node || !isLocatorEntry(node)) {
    throw new Error(`[locatorRegistry] Locator key not found or invalid: "${key}"`);
  }
  return node.primary;
}

/**
 * Returns all selectors in priority order:
 *  primary first, then fallbacks (if any)
 */
export function getLocatorCandidates(key: string): string[] {
  const node = resolveNode(key);
  if (!node || !isLocatorEntry(node)) {
    throw new Error(`[locatorRegistry] Locator key not found or invalid: "${key}"`);
  }
  const fallbacks = Array.isArray(node.fallbacks) ? node.fallbacks : [];
  return [node.primary, ...fallbacks];
}

/**
 * Validate keys exist at startup (fail fast).
 * Call this once in a global setup or in your test fixtures.
 */
export function validateLocatorKeys(keys: string[]): void {
  const missing: string[] = [];

  for (const key of keys) {
    try {
      const node = resolveNode(key);
      if (!node || !isLocatorEntry(node)) missing.push(key);
    } catch {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg =
      `[locatorRegistry] Missing/invalid locator keys:\n` +
      missing.map(k => `  - ${k}`).join('\n');
    throw new Error(msg);
  }
}

/**
 * Optional helper: returns list of loaded packs.
 * Useful for debugging.
 */
export function listLocatorPacks(): string[] {
  return Object.keys(packs).sort();
}