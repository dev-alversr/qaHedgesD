import { calculateSubtotal } from '@utils/calculators/subtotal';
import { ProductModel } from './Product.model';

export interface CartItemSnapshot {
  name: string;
  unitPrice: number;
  qty: number;
  lineSubtotal?: number;  // optional if UI hides it
  source?: 'cart' | 'checkout';
}

/**
 * CartItem = Product + quantity + computed subtotal logic.
 */
export class CartItemModel {
  readonly product: ProductModel;
  readonly qty: number;
  readonly lineSubtotal?: number;
  readonly source?: 'cart' | 'checkout';

  constructor(snapshot: CartItemSnapshot) {
    if (!snapshot.name) {
      throw new Error('[CartItemModel] name is required');
    }

    if (!Number.isFinite(snapshot.unitPrice)) {
      throw new Error('[CartItemModel] unitPrice must be a valid number');
    }

    if (!Number.isInteger(snapshot.qty) || snapshot.qty < 1) {
      throw new Error('[CartItemModel] qty must be integer >= 1');
    }

    this.product = new ProductModel({
      name: snapshot.name,
      unitPrice: snapshot.unitPrice,
      source: snapshot.source ?? 'cart'
    });

    this.qty = snapshot.qty;
    this.lineSubtotal = snapshot.lineSubtotal;
    this.source = snapshot.source;
  }

  /**
   * Compute subtotal based on qty × unitPrice
   */
  computeSubtotal(decimalPlaces = 2): number {
    return calculateSubtotal(
      [{ unitPrice: this.product.unitPrice, qty: this.qty }],
      decimalPlaces
    );
  }

  /**
   * Validates that displayed subtotal matches computed subtotal.
   */
  isSubtotalValid(tolerance = 0.01): boolean {
    if (typeof this.lineSubtotal !== 'number') return true; // cannot validate

    const expected = this.computeSubtotal();
    return Math.abs(expected - this.lineSubtotal) <= tolerance;
  }

  /**
   * Compare this cart item with another (cart → checkout).
   */
  equals(other: CartItemModel, tolerance = 0.01): boolean {
    const productMatch = this.product.equals(other.product, tolerance);
    const qtyMatch = this.qty === other.qty;

    const subtotalMatch =
      typeof this.lineSubtotal === 'number' &&
      typeof other.lineSubtotal === 'number'
        ? Math.abs(this.lineSubtotal - other.lineSubtotal) <= tolerance
        : true;

    return productMatch && qtyMatch && subtotalMatch;
  }
}