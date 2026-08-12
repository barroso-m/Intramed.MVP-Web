import { test, expect } from '@playwright/test';
import { FeedPage } from '../../pages/Intramed/FeedPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

test.describe('Feed', () => {
  test('[IE-T19] TC03 - crear publicación con texto y emoji', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    const postContent = `Post automatizado ${Date.now()}`;
    await feedPage.openCreatePostModal();
    await feedPage.typePostContent(postContent);
    await feedPage.addEmoji('💪');
    await feedPage.submitPost();

    await expect(page.getByText(postContent).first()).toBeVisible({ timeout: 10000 });
  });
});
