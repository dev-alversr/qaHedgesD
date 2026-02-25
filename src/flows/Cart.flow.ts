import { Page } from '@playwright/test';
import { HeaderComponent } from '@components/common/Header.component';
import { MiniCartComponent } from '@components/common/MiniCart.component';
import { ListingPage } from '@pages/Listing.page';
import { ProductPage } from '@pages/Product.page';
import { CartPage } from '@pages/Cart.page';

export type CartAddResult = {
  addedProductName?: string;
  cartUrl?: string;
};

export class CartFlow {
  private readonly page: Page;
  private readonly header: HeaderComponent;
  private readonly miniCart: MiniCartComponent;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.miniCart = new MiniCartComponent(page);
  }

  /**
   * Add to cart by searching then opening first product card.
   * This avoids hardcoding product URLs and stays black-box friendly.
   */
  async addFirstSearchResultToCart(query: string, qty = 1): Promise<CartAddResult> {
    const listingPage = new ListingPage(this.page);
    const productPage = new ProductPage(this.page);

    await this.page.goto('https://www.hedgesdirect.co.uk/');
    await this.header.search(query);

    // Now we are on results/listing. Click first product card (ListingPage should implement this)
    await listingPage.clickProductAt(0);

    // PDP: set qty (best effort) and add
    await productPage.setQuantity(qty);
    const name = await productPage.getTitle().catch(() => undefined);
    await productPage.addToCart();

    // mini-cart might open; if not, user can navigate to cart later
    return { addedProductName: name };
  }

  async openCartFromMiniCart(): Promise<void> {
    // From mini cart, go to edit basket
    await this.miniCart.viewAndEditBasket();
  }

  async getCartFirstItemSnapshot(): Promise<any> {
    const cartPage = new CartPage(this.page);
    return cartPage.getItemDetails(0);
  }
}