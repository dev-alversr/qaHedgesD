import { Locator, Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export class HeaderComponent {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  logo(): Locator {
    return this.page.locator(getLocator('header.logo'));
  }

  searchInput(): Locator {
    return this.page.locator(getLocator('header.search.input'));
  }

  searchOpenBtn(): Locator {
    return this.page.locator(getLocator('header.search.openBtn'));
  }

  searchSubmitBtn(): Locator {
    return this.page.locator(getLocator('header.search.submit'));
  }

  cartLink(): Locator {
    return this.page.locator(getLocator('header.cartLink'));
  }

  async goHome(): Promise<void> {
    await this.logo().click();
  }

  async openSearchIfNeeded(): Promise<void> {
    // Some headers hide input behind a search icon
    const inputVisible = await this.searchInput().first().isVisible().catch(() => false);
    if (!inputVisible) {
      const btnVisible = await this.searchOpenBtn().first().isVisible().catch(() => false);
      if (btnVisible) await this.searchOpenBtn().click();
    }
  }

  async search(query: string): Promise<void> {
    await this.openSearchIfNeeded();
    await this.searchInput().fill(query);
    // Prefer explicit submit if present; otherwise press Enter
    const submitVisible = await this.searchSubmitBtn().first().isVisible().catch(() => false);
    if (submitVisible) {
      await this.searchSubmitBtn().click();
    } else {
      await this.searchInput().press('Enter');
    }
  }

  async openCart(): Promise<void> {
    await this.cartLink().click();
  }
}