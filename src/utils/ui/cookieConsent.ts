import { Page } from '@playwright/test';
import { getLocator } from '@locators/locatorRegistry';

export async function acceptCookiesIfPresent(page: Page): Promise<void> {
  const acceptBtn = page.locator(getLocator('cookieBanner.acceptAll')).first();

  // If banner appears late, give it a short window but don’t block tests
  const visible = await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false);
  if (!visible) return;

  await acceptBtn.click({ timeout: 5000 });

  // small stabilization wait for overlay to disappear
  await page.waitForTimeout(250);
}