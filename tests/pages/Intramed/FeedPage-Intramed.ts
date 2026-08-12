import { Page, Locator } from '@playwright/test';

export class FeedPage {
  readonly createPostButton: Locator;
  readonly postEditor: Locator;
  readonly nextButton: Locator;
  readonly publishButton: Locator;
  readonly emojiPickerButton: Locator;
  readonly userNavLink: Locator;

  constructor(private readonly page: Page) {
    this.createPostButton = page.getByTestId('post-composer-bar-trigger');
    this.postEditor = page.locator('.tiptap');
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.publishButton = page.getByRole('button', { name: 'Crear publicación' });
    this.emojiPickerButton = page.getByRole('button', { name: 'Insertar emoji' });
    this.userNavLink = page.getByRole('navigation').getByRole('link', { name: /barroso/i });
  }

  async goto() {
    await this.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.createPostButton.waitFor({ state: 'visible' });
  }

  async openCreatePostModal() {
    await this.createPostButton.click();
    await this.postEditor.waitFor({ state: 'visible' });
  }

  async typePostContent(content: string) {
    await this.postEditor.click();
    await this.postEditor.fill(content);
  }

  async addEmoji(emoji: string) {
    await this.emojiPickerButton.click();
    await this.page.getByRole('button', { name: emoji }).click();
  }

  async submitPost() {
    await this.nextButton.click();
    await this.publishButton.click();
  }

  async createTextPost(content: string) {
    await this.openCreatePostModal();
    await this.typePostContent(content);
    await this.submitPost();
  }

  async createPostWithEmoji(content: string, emoji: string) {
    await this.openCreatePostModal();
    await this.typePostContent(content);
    await this.addEmoji(emoji);
    await this.submitPost();
  }

  async getLatestPostContent(): Promise<string> {
    const firstPost = this.page.locator('[class*="post"], article').first();
    await firstPost.waitFor({ state: 'visible' });
    return firstPost.innerText();
  }
}
