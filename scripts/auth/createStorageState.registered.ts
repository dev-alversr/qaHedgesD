import { chromium, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { getLocator } from '../../src/locators/locatorRegistry';

const BASE_URL = process.env.BASE_URL ?? 'https://www.hedgesdirect.co.uk';

const USERS_PATH = path.resolve('test-data/users.json');
const STORAGE_DIR = path.resolve('test-assets/storageStates');
const STORAGE_PATH = path.join(STORAGE_DIR, 'registered.json');

const DEBUG_DIR = path.resolve('test-assets/debug');
const FAIL_SHOT = path.join(DEBUG_DIR, 'login-failed.png');

async function readRegisteredUser(): Promise<{ email: string; password: string }> {
  if (!fs.existsSync(USERS_PATH)) throw new Error(`users.json not found at: ${USERS_PATH}`);
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  const data = JSON.parse(raw);

  const email = data?.registered?.email;
  const password = data?.registered?.password;

  if (!email || !password) {
    throw new Error('Missing registered.email or registered.password in test-data/users.json');
  }
  return { email, password };
}

async function acceptCookiesIfPresent(page: Page): Promise<void> {
  const accept = page.getByRole('button', { name: 'Accept All Cookies' }).first();
  const visible = await accept.isVisible({ timeout: 5000 }).catch(() => false);
  if (!visible) return;

  await accept.click({ timeout: 5000 }).catch(async () => {
    await page.locator('text=Accept All Cookies').first().click({ timeout: 5000 });
  });

  await page.waitForTimeout(250);
}

async function main() {
  const { email, password } = await readRegisteredUser();

  const browser = await chromium.launch({ headless: false }); // keep visible until stable
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening login page...');
  await page.goto(`${BASE_URL}/customer/account/login/`, { waitUntil: 'domcontentloaded' });
  await acceptCookiesIfPresent(page);

  console.log('Filling credentials...');
  await page.locator(getLocator('login.email')).first().fill(email);
  await page.locator(getLocator('login.password')).first().fill(password);

  console.log('Submitting...');
  await page.locator(getLocator('login.signIn')).first().click();

  // Wait for navigation/state settle
  await page.waitForLoadState('networkidle').catch(() => {});
  await acceptCookiesIfPresent(page);

  // Detect login error
  const err = page.locator(getLocator('login.error')).first();
  const hasErr = await err.isVisible({ timeout: 3000 }).catch(() => false);

  if (hasErr) {
    const msg = await err.innerText().catch(() => 'Unknown login error');
    fs.mkdirSync(DEBUG_DIR, { recursive: true });
    await page.screenshot({ path: FAIL_SHOT, fullPage: true }).catch(() => {});
    throw new Error(`Login failed. Message: ${msg}. Screenshot: ${FAIL_SHOT}`);
  }

  // Best-effort “logged in” signal (My Account / Sign Out often appears)
  const loggedInSignal = await page
    .locator('text=/My Account|Sign Out|Logout|Account/i')
    .first()
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!loggedInSignal) {
    console.warn(
      'Warning: Could not confirm login via UI signal. Saving storageState anyway (verify by running registered tests).'
    );
  } else {
    console.log('Login confirmed.');
  }

  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  await context.storageState({ path: STORAGE_PATH });

  console.log(`✅ Storage state saved: ${STORAGE_PATH}`);

  await browser.close();
}

main().catch((err) => {
  console.error('❌ Failed to create storage state:', err);
  process.exit(1);
});