import { test, expect, BrowserContext, Page } from '@playwright/test';
import { ChatPage } from '../../pages/Intramed/ChatPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

const USER2_DISPLAY_NAME = 'Chat Automation';

async function openSenderChatWithUser2(browser: import('@playwright/test').Browser): Promise<{ ctx: BrowserContext; page: Page; chat: ChatPage }> {
  const ctx = await browser.newContext({ storageState: 'playwright/.auth/auth.json' });
  const page = await ctx.newPage();
  const chat = new ChatPage(page);
  await chat.goto();

  const existing = chat.conversationItem(new RegExp(USER2_DISPLAY_NAME, 'i'));
  if (!(await existing.count())) {
    await chat.nuevoMensajeButton.click();
    const search = page.getByPlaceholder(/^Buscar$/).last();
    await search.waitFor({ state: 'visible' });
    await search.fill(USER2_DISPLAY_NAME);
    await page.waitForTimeout(2500);
    await page.getByRole('button').filter({ hasText: new RegExp(`${USER2_DISPLAY_NAME}.*Argentina`, 'i') }).first().click();
  } else {
    await existing.click();
  }
  await chat.messageInput.waitFor({ state: 'visible', timeout: 15000 });

  return { ctx, page, chat };
}

test.describe('Chat', () => {
  test('[IE-T69] CHT-001 - visualización general de la mensajería', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();

    await expect(chatPage.pageHeading).toBeVisible();
    await expect(chatPage.nuevoMensajeButton).toBeVisible();
    await expect(chatPage.tabTodos).toBeVisible();
    await expect(chatPage.tabNoLeidos).toBeVisible();
    await expect(chatPage.tabSolicitudes).toBeVisible();
    await expect(chatPage.searchInput).toBeVisible();
  });

  test('[IE-T70] CHT-002 - enviar mensaje en conversación existente', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();
    await chatPage.openConversation('Sr. Test Test');

    const message = `Mensaje QA ${Date.now()}`;
    await chatPage.messageInput.fill(message);
    await chatPage.messageInput.press('Enter');

    await expect(page.getByText(message).first()).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T71] CHT-003 - abrir panel Nuevo mensaje', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();
    await chatPage.nuevoMensajeButton.click();

    await expect(page.getByPlaceholder(/buscar/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T72] CHT-004 - tab No leídos filtra conversaciones', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();
    await chatPage.tabNoLeidos.click();
    await page.waitForTimeout(1000);
    await expect(chatPage.tabTodos).toBeVisible();
  });

  test('[IE-T75] CHT-007 - tab Solicitudes', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();
    await chatPage.tabSolicitudes.click();
    await page.waitForTimeout(1000);
    await expect(chatPage.tabTodos).toBeVisible();
  });

  test('[IE-T76] CHT-008 - buscador filtra conversaciones', { tag: '@chat' }, async ({ page }) => {
    const chatPage = new ChatPage(page);

    await chatPage.goto();

    await chatPage.searchInput.fill('Sr. Test Test');
    await page.waitForTimeout(1000);
    await expect(chatPage.conversationItem('Sr. Test Test')).toBeVisible();

    await chatPage.searchInput.fill('zzzzz-no-match-xyz');
    await page.waitForTimeout(1000);
    await expect(chatPage.conversationItem('Sr. Test Test')).not.toBeVisible();

    await chatPage.searchInput.fill('');
    await page.waitForTimeout(500);
    await expect(chatPage.conversationItem('Sr. Test Test')).toBeVisible();
  });

  test('[IE-T73] CHT-005 - recepción de mensaje entre usuarios', { tag: '@chat' }, async ({ browser }) => {
    const receiverCtx = await browser.newContext({ storageState: 'playwright/.auth/auth-user2.json' });
    const receiverPage = await receiverCtx.newPage();
    const receiverChat = new ChatPage(receiverPage);
    await receiverChat.goto();

    const sender = await openSenderChatWithUser2(browser);

    const uniqueMsg = `Auto-inbox ${Date.now()}`;
    await sender.chat.messageInput.fill(uniqueMsg);
    await sender.chat.messageInput.press('Enter');
    await sender.page.waitForTimeout(2000);

    await expect(receiverPage.getByText(uniqueMsg).first()).toBeVisible({ timeout: 20000 });

    await sender.ctx.close();
    await receiverCtx.close();
  });

  test('[IE-T74] CHT-006 - pill de Mensajes en navbar al recibir', { tag: '@chat' }, async ({ browser }) => {
    const receiverCtx = await browser.newContext({ storageState: 'playwright/.auth/auth-user2.json' });
    const receiverPage = await receiverCtx.newPage();
    await receiverPage.goto('/feed', { waitUntil: 'domcontentloaded' });
    await receiverPage.waitForLoadState('networkidle');

    const sender = await openSenderChatWithUser2(browser);

    const uniqueMsg = `Auto-pill ${Date.now()}`;
    await sender.chat.messageInput.fill(uniqueMsg);
    await sender.chat.messageInput.press('Enter');
    await sender.page.waitForTimeout(2000);

    const mensajesItem = receiverPage.locator('nav *, [class*="sidebar"] *').filter({ hasText: /^Mensajes$|^Mensagens$/i }).first();
    await expect(mensajesItem).toBeVisible({ timeout: 10000 });

    await sender.ctx.close();
    await receiverCtx.close();
  });
});
