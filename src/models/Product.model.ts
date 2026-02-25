export type ProductSource =
  | 'listing'
  | 'pdp'
  | 'cart'
  | 'checkout';

export interface ProductSnapshot {
  name: string;
  url?: string;
  sku?: string;

  unitPrice: number;      // normalized number
  wasPrice?: number;      // optional for sale items

  source: ProductSource;
}

/**
 * Domain model for a product (immutable by default).
 */
export class ProductModel {
  readonly name: string;
  readonly url?: string;
  readonly sku?: string;
  readonly unitPrice: number;
  readonly wasPrice?: number;
  readonly source: ProductSource;

  constructor(snapshot: ProductSnapshot) {
    if (!snapshot.name) {
      throw new Error('[ProductModel] name is required');
    }
    if (!Number.isFinite(snapshot.unitPrice)) {
      throw new Error('[ProductModel] unitPrice must be a valid number');
    }

    this.name = snapshot.name.trim();
    this.url = snapshot.url;
    this.sku = snapshot.sku;
    this.unitPrice = snapshot.unitPrice;
    this.wasPrice = snapshot.wasPrice;
    this.source = snapshot.source;
  }

  isDiscounted(): boolean {
    return (
      typeof this.wasPrice === 'number' &&
      this.wasPrice > this.unitPrice
    );
  }

  discountAmount(): number {
    if (!this.isDiscounted()) return 0;
    return Number((this.wasPrice! - this.unitPrice).toFixed(2));
  }

  equals(other: ProductModel, tolerance = 0.01): boolean {
    if (!other) return false;

    const priceClose =
      Math.abs(this.unitPrice - other.unitPrice) <= tolerance;

    const nameMatch =
      other.name.toLowerCase().includes(this.name.toLowerCase());

    return priceClose && nameMatch;
  }
}