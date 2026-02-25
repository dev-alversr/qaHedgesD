import { test, expect } from '@fixtures/testFixtures';
import { CartItemModel } from '@models/CartItem.model';
import { expectSubtotalMatchesLines } from '@assertions/pricing.assert';

test.describe('Cart - Subtotal Recalculation', () => {

  test('Updating quantity recalculates subtotal correctly', async ({
    asRegistered,
    cartFlow,
    cartPage
  }) => {

    const page = await asRegistered({ reuseStorageState: true });

    await cartFlow.addFirstSearchResultToCart('laurel', 1);
    await cartFlow.openCartFromMiniCart();

    // Snapshot initial
    let snapshot = await cartPage.getItemDetails(0);

    if (!snapshot.name) {
        throw new Error('Cart item name is missing (locator mismatch or cart not rendered).');
    }

    const original = new CartItemModel({
      name: snapshot.name,
      unitPrice: snapshot.unitPrice,
      qty: snapshot.qty,
      lineSubtotal: snapshot.subtotal,
      source: 'cart'
    });

    // Update quantity
    const newQty = original.qty + 2;
    await cartPage.updateQuantity(0, newQty); // Ensure this method exists in Cart.page.ts

    // Snapshot updated
    snapshot = await cartPage.getItemDetails(0);

    //Fix
    if (!snapshot.name) {
        throw new Error('Cart item name is missing after qty update (locator mismatch or UI not refreshed).');
    }

    const updated = new CartItemModel({
      name: snapshot.name,
      unitPrice: snapshot.unitPrice,
      qty: snapshot.qty,
      lineSubtotal: snapshot.subtotal,
      source: 'cart'
    });

    expect(updated.qty).toBe(newQty);

    // Validate recalculated subtotal
    expect(updated.isSubtotalValid()).toBeTruthy();

    // Validate cart subtotal matches lines
    const cartSubtotal = await cartPage.getCartSubtotal();

    expectSubtotalMatchesLines(
      [
        {
          name: updated.product.name,
          unitPrice: updated.product.unitPrice,
          qty: updated.qty
        }
      ],
      cartSubtotal
    );
  });

});