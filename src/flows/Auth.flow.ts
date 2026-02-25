import { Page } from '@playwright/test';
import { LoginPage } from '@pages/Login.page';

export class AuthFlow {
  private readonly page: Page;
  private readonly loginPage: LoginPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  /**
   * Logs in using registered creds attached by fixture (asRegistered),
   * or by explicitly passing credentials.
   */
  async loginRegistered(opts?: { email?: string; password?: string; saveStorageState?: boolean }): Promise<void> {
    const email = opts?.email ?? (this.page as any).__registeredUser?.email;
    const password = opts?.password ?? (this.page as any).__registeredUser?.password;

    if (!email || !password) {
      throw new Error('[AuthFlow] Missing registered user creds. Provide opts.email/password or use asRegistered() fixture.');
    }

    // Best-effort: open a page that exposes login panel (checkout panel is common)
    await this.page.goto('https://www.hedgesdirect.co.uk/checkout').catch(async () => {
      await this.page.goto('https://www.hedgesdirect.co.uk/');
    });

    await this.loginPage.login(email, password);

    // Optional: persist storageState for reuse
    if (opts?.saveStorageState) {
      const storageStatePath = (this.page as any).__storageStatePath;
      if (!storageStatePath) return;
      await this.page.context().storageState({ path: storageStatePath });
    }
  }

  async logoutBestEffort(): Promise<void> {
    // Black-box: site logout location may vary
    // Keep this as a placeholder hook to implement once logout UI confirmed.
    // Example later: click account menu -> Sign Out
  }
}