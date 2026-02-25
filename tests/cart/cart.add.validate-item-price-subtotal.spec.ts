import { test, expect } from '@fixtures/testFixtures';
import { CartItemModel } from '@models/CartItem.model';
import {
  expectLineSubtotalValid,
  expectSubtotalMatchesLines
} from '@assertions/pricing.assert';

test.describe('Cart - Add Item & Validate Pricing', () => {

  test('Add product and validate item, unit price and subtotal', async ({
    asRegistered,
    cartFlow,
    cartPage
  }) => {

    const page = await asRegistered({ reuseStorageState: true });

    // 1️⃣ Add product via search
    const result = await cartFlow.addFirstSearchResultToCart('laurel', 2);

    // 2️⃣ Navigate to full cart
    await cartFlow.openCartFromMiniCart();

    // 3️⃣ Snapshot first line
    const snapshot = await cartPage.getItemDetails(0);

    //fix
    if (!snapshot.name) {
        throw new Error('Cart item name is missing (locator mismatch or item not rendered).');
    }

    const cartItem = new CartItemModel({
      name: snapshot.name,
      unitPrice: snapshot.unitPrice,
      qty: snapshot.qty,
      lineSubtotal: snapshot.subtotal,
      source: 'cart'
    });

    // Core field validation
    expect(cartItem.product.name).toBeTruthy();
    expect(cartItem.qty).toBe(2);

    // Line subtotal validation
    expectLineSubtotalValid({
      name: cartItem.product.name,
      unitPrice: cartItem.product.unitPrice,
      qty: cartItem.qty,
      lineSubtotal: cartItem.lineSubtotal
    });

    // Validate cart subtotal equals sum of lines
    const cartSubtotal = await cartPage.getCartSubtotal();

    expectSubtotalMatchesLines(
      [
        {
          name: cartItem.product.name,
          unitPrice: cartItem.product.unitPrice,
          qty: cartItem.qty
        }
      ],
      cartSubtotal
    );
  });

});