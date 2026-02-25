import { test, expect } from '@fixtures/testFixtures';
import { CartItemModel } from '@models/CartItem.model';
import { expectPriceStable } from '@assertions/pricing.assert';
import { acceptCookiesIfPresent } from '@utils/ui/cookieConsent';


test.describe('Checkout - Registered Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await acceptCookiesIfPresent(page);
  });
  
  test('Registered user completes checkout pricing validation', async ({
    asRegistered,
    cartFlow,
    checkoutFlow,
    cartPage
  }) => {

    const page = await asRegistered({ reuseStorageState: true });

    // 1️⃣ Add product
    await cartFlow.addFirstSearchResultToCart('laurel', 2);
    await cartFlow.openCartFromMiniCart();

    // Snapshot cart state
    const cartSnapshot = await cartPage.getItemDetails(0);

    if (!cartSnapshot.name) {
        throw new Error('Cart item name is missing before checkout.');
    }

    const cartItem = new CartItemModel({
      name: cartSnapshot.name,
      unitPrice: cartSnapshot.unitPrice,
      qty: cartSnapshot.qty,
      lineSubtotal: cartSnapshot.subtotal,
      source: 'cart'
    });

    expect(cartItem.isSubtotalValid()).toBeTruthy();

    // 2️⃣ Proceed to checkout
    await checkoutFlow.proceedToCheckoutFromCart();

    // Snapshot again before payment
    const { cartItem: checkoutSnapshot } =
      await checkoutFlow.snapshotBeforePayment();

    const checkoutItem = new CartItemModel({
      name: checkoutSnapshot?.name,
      unitPrice: checkoutSnapshot?.unitPrice,
      qty: checkoutSnapshot?.qty,
      lineSubtotal: checkoutSnapshot?.lineSubtotal,
      source: 'checkout'
    });

    // Validate pricing did not change
    expectPriceStable(
      {
        name: cartItem.product.name,
        unitPrice: cartItem.product.unitPrice,
        qty: cartItem.qty,
        lineSubtotal: cartItem.lineSubtotal
      },
      {
        name: checkoutItem.product.name,
        unitPrice: checkoutItem.product.unitPrice,
        qty: checkoutItem.qty,
        lineSubtotal: checkoutItem.lineSubtotal
      }
    );
  });

});