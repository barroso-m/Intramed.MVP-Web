import { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly pageHeading: Locator;
  readonly nuevoMensajeButton: Locator;
  readonly tabTodos: Locator;
  readonly tabNoLeidos: Locator;
  readonly tabSolicitudes: Locator;
  readonly searchInput: Locator;
  readonly conversationItem: (name: string | RegExp) => Locator;
  readonly messageInput: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.getByRole('heading', { name: 'Gestión de mensajería' });
    this.nuevoMensajeButton = page.getByRole('button', { name: 'Nuevo mensaje', exact: true });
    this.tabTodos = page.getByRole('button', { name: 'Todos', exact: true }).filter({ visible: true }).first();
    this.tabNoLeidos = page.getByRole('button', { name: 'No leídos', exact: true }).filter({ visible: true }).first();
    this.tabSolicitudes = page.getByRole('button', { name: 'Solicitudes', exact: true }).filter({ visible: true }).first();
    this.searchInput = page.getByPlaceholder('Buscar conversaciones');
    this.conversationItem = (name) =>
      page.getByRole('button').filter({ hasText: name }).filter({ visible: true }).first();
    this.messageInput = page.getByPlaceholder(/^Escribir/).first();
  }

  async goto() {
    await this.page.goto('/profile/chat', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async openConversation(name: string | RegExp) {
    await this.conversationItem(name).click();
    await this.messageInput.waitFor({ state: 'visible' });
  }
}
