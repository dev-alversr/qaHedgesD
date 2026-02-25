import { Browser, BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type RegisteredUser = { email: string; password: string };

const STORAGE_DIR = path.resolve('test-assets/storageStates');
const REGISTERED_STATE_PATH = path.join(STORAGE_DIR, 'registered.json');

function readRegisteredUserFromTestData(): RegisteredUser {
  // Keep it simple: import JSON at runtime to avoid bundler issues
  const p = path.resolve('test-data/users.json');
  const raw = fs.readFileSync(p, 'utf-8');
  const data = JSON.parse(raw);

  if (!data?.registered?.email || !data?.registered?.password) {
    throw new Error('[roles] Missing registered user creds in test-data/users.json (registered.email/password)');
  }
  return { email: data.registered.email, password: data.registered.password };
}

export async function getGuestContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext();
}

/**
 * Creates or reuses a storageState for registered user.
 * NOTE: Login navigation is handled by AuthFlow (in flows) to keep responsibilities clear.
 */
export async function getRegisteredContext(
  browser: Browser,
  options?: { reuseStorageState?: boolean }
): Promise<{ context: BrowserContext; user: RegisteredUser; storageStatePath: string }> {
  const user = readRegisteredUserFromTestData();
  const reuse = options?.reuseStorageState ?? true;

  fs.mkdirSync(STORAGE_DIR, { recursive: true });

  const context = await browser.newContext({
    storageState: reuse && fs.existsSync(REGISTERED_STATE_PATH) ? REGISTERED_STATE_PATH : undefined
  });

  return { context, user, storageStatePath: REGISTERED_STATE_PATH };
}