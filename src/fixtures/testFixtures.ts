import { test as base, expect, Page } from '@playwright/test';
import { getGuestContext, getRegisteredContext } from './roles';

// Pages
import { ListingPage } from '@pages/Listing.page';
import { ProductPage } from '@pages/Product.page';
import { CartPage } from '@pages/Cart.page';
import { CheckoutPage } from '@pages/Checkout.page';
import { LoginPage } from '@pages/Login.page';

// Components
import { HeaderComponent } from '@components/common/Header.component';
import { MiniCartComponent } from '@components/common/MiniCart.component';

// Flows
import { AuthFlow } from '@flows/Auth.flow';
import { CartFlow } from '@flows/Cart.flow';
import { CheckoutFlow } from '@flows/Checkout.flow';



type Fixtures = {
  // role helpers
  asGuest: () => Promise<Page>;
  asRegistered: (opts?: { reuseStorageState?: boolean }) => Promise<Page>;

  // page objects
  listingPage: ListingPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loginPage: LoginPage;

  // components
  header: HeaderComponent;
  miniCart: MiniCartComponent;

  // flows
  authFlow: AuthFlow;
  cartFlow: CartFlow;
  checkoutFlow: CheckoutFlow;
};

export const test = base.extend<Fixtures>({
  asGuest: async ({ browser }, use) => {
    await use(async () => {
      const ctx = await getGuestContext(browser);
      const page = await ctx.newPage();
      // Ensure caller closes context by closing page
      page.on('close', async () => ctx.close().catch(() => {}));
      return page;
    });
  },

  asRegistered: async ({ browser }, use) => {
    await use(async (opts) => {
      const { context, user, storageStatePath } = await getRegisteredContext(browser, opts);

      const page = await context.newPage();
      // Attach for later use by AuthFlow if needed
      (page as any).__registeredUser = user;
      (page as any).__storageStatePath = storageStatePath;

      page.on('close', async () => context.close().catch(() => {}));
      return page;
    });
  },

  listingPage: async ({ page }, use) => use(new ListingPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),

  header: async ({ page }, use) => use(new HeaderComponent(page)),
  miniCart: async ({ page }, use) => use(new MiniCartComponent(page)),

  authFlow: async ({ page }, use) => use(new AuthFlow(page)),
  cartFlow: async ({ page }, use) => use(new CartFlow(page)),
  checkoutFlow: async ({ page }, use) => use(new CheckoutFlow(page))
});

export { expect };