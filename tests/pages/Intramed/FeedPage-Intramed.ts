import { Page, Locator } from '@playwright/test';

export class FeedPage {
  readonly createPostButton: Locator;
  readonly postEditor: Locator;
  readonly nextButton: Locator;
  readonly publishButton: Locator;
  readonly emojiPickerButton: Locator;
  readonly userNavLink: Locator;

  // Filters (left panel)
  readonly filterPersonas: Locator;
  readonly filterInstitucion: Locator;
  readonly filterLimpiar: Locator;
  readonly filterArticulos: Locator;
  readonly filterEncuestas: Locator;
  readonly filterEventos: Locator;
  readonly filterPosteos: Locator;

  // Right sidebar
  readonly institucionesSugeridasHeading: Locator;
  readonly personasSugeridasHeading: Locator;
  readonly eventosDestacadosHeading: Locator;

  // Profile card
  readonly colegasLink: Locator;
  readonly seguidosLink: Locator;
  readonly seguidoresLink: Locator;

  // First post interactions (aria-label based, first visible)
  readonly firstLikeButton: Locator;
  readonly firstLikeCount: Locator;
  readonly firstCommentButton: Locator;
  readonly firstRepostButton: Locator;
  readonly firstSaveButton: Locator;
  readonly firstShareButton: Locator;

  // Repost modal
  readonly repostModalHeading: Locator;
  readonly repostEditor: Locator;
  readonly repostSubmitButton: Locator;
  readonly repostCloseButton: Locator;

  // Comment
  readonly commentTextInput: Locator;
  readonly commentSubmitButton: Locator;

  constructor(private readonly page: Page) {
    this.createPostButton = page.getByTestId('post-composer-bar-trigger');
    this.postEditor = page.locator('.tiptap');
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.publishButton = page.getByRole('button', { name: 'Crear publicación' });
    this.emojiPickerButton = page.getByRole('button', { name: 'Insertar emoji' });
    this.userNavLink = page.getByRole('navigation').getByRole('link', { name: /barroso/i });

    const visibleBtn = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true }).first();
    this.filterPersonas = visibleBtn('Personas');
    this.filterInstitucion = visibleBtn('Institución');
    this.filterLimpiar = visibleBtn('Limpiar');
    this.filterArticulos = visibleBtn('Artículos');
    this.filterEncuestas = visibleBtn('Encuestas');
    this.filterEventos = visibleBtn('Eventos');
    this.filterPosteos = visibleBtn('Posteos');

    this.institucionesSugeridasHeading = page.getByText('Instituciones sugeridas', { exact: true }).filter({ visible: true }).first();
    this.personasSugeridasHeading = page.getByText('Personas sugeridas', { exact: true }).filter({ visible: true }).first();
    this.eventosDestacadosHeading = page.getByText('Eventos destacados', { exact: true }).filter({ visible: true }).first();

    this.colegasLink = page.getByRole('link', { name: /colegas/i }).filter({ visible: true }).first();
    this.seguidosLink = page.getByRole('link', { name: /seguidos/i }).filter({ visible: true }).first();
    this.seguidoresLink = page.getByRole('link', { name: /seguidores/i }).filter({ visible: true }).first();

    this.firstLikeButton = page.locator('button[aria-label="like"]').first();
    this.firstLikeCount = page.locator('button[aria-label="view likes"]').first();
    this.firstCommentButton = page.locator('button[aria-label="comment"]').first();
    this.firstRepostButton = page.locator('button[aria-label="repost"]').first();
    this.firstSaveButton = page.locator('button[aria-label="save"]').first();
    this.firstShareButton = page.locator('button[aria-label="share"]').first();

    this.repostModalHeading = page.getByRole('heading', { name: /repostear/i });
    this.repostEditor = page.getByRole('dialog').locator('.tiptap').first();
    this.repostSubmitButton = page.getByRole('button', { name: 'Repostear', exact: true });
    this.repostCloseButton = page.getByRole('dialog').locator('button:has(svg.feather-x)').first();

    this.commentTextInput = page.getByPlaceholder(/comentar|comentario/i).first();
    this.commentSubmitButton = page.getByRole('button', { name: 'Comentar', exact: true });
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

  async toggleFirstLike() {
    await this.firstLikeButton.click();
  }

  async toggleFirstSave() {
    await this.firstSaveButton.click();
  }

  async openRepostModal() {
    await this.firstRepostButton.click();
    await this.repostModalHeading.waitFor({ state: 'visible' });
  }
}
