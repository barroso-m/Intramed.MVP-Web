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
  readonly organicPosts: Locator;
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

  // Composer media & destination (video, publicar como institución)
  readonly mediaInput: Locator;
  readonly destinationSelect: Locator;
  readonly composerFinalSubmit: Locator;

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

    // El feed intercala publicaciones patrocinadas en posiciones variables, y
    // esas no abren el modal de repost. Operamos siempre sobre el primer post
    // orgánico para que no dependa de qué quedó arriba en esta corrida.
    this.organicPosts = page
      .locator('article')
      .filter({ hasNot: page.getByText('Patrocinado', { exact: true }) });
    const firstOrganic = this.organicPosts.first();

    this.firstLikeButton = firstOrganic.getByRole('button', { name: 'like', exact: true });
    this.firstLikeCount = firstOrganic.getByRole('button', { name: 'view likes', exact: true });
    this.firstCommentButton = firstOrganic.getByRole('button', { name: 'comment', exact: true });
    this.firstRepostButton = firstOrganic.getByRole('button', { name: 'repost', exact: true });
    this.firstSaveButton = page.locator('button[aria-label="save"]').first();
    this.firstShareButton = page.locator('button[aria-label="share"]').first();

    this.repostModalHeading = page.getByRole('heading', { name: /repostear/i });
    this.repostEditor = page.getByRole('dialog').locator('.tiptap').first();
    this.repostSubmitButton = page.getByRole('button', { name: 'Repostear', exact: true });
    this.repostCloseButton = page.getByRole('dialog').locator('button:has(svg.feather-x)').first();

    this.commentTextInput = page.getByPlaceholder(/comentar|comentario/i).first();
    this.commentSubmitButton = page.getByRole('button', { name: 'Comentar', exact: true });

    this.mediaInput = page.locator('input[data-testid="post-composer-media-input"]');
    this.destinationSelect = page.locator('#post-composer-destination-select');
    this.composerFinalSubmit = page.getByRole('button', { name: 'Crear publicación', exact: true });
  }

  async selectDestination(name: string | RegExp) {
    // react-select: click the visible control container (not the hidden input)
    const destContainer = this.page.locator('[data-testid="post-composer-destination"] .css-cp01gg-control').first();
    await destContainer.scrollIntoViewIfNeeded();
    await destContainer.click({ force: true });
    await this.page.waitForTimeout(600);
    const option = this.page.locator('[id^="react-select-"][id*="option"]')
      .filter({ hasText: name })
      .first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(400);
  }

  async attachMedia(filePath: string) {
    await this.mediaInput.setInputFiles(filePath);
    // La subida es async y puede tardar bastante en browsers lentos. Esperamos a que
    // "Siguiente" se habilite o a que el composer muestre el error de carga, lo que
    // pase primero, para fallar con la causa real en vez de un timeout en el click.
    const uploadError = this.page.getByText('Ocurrió un error al cargar el archivo').first();
    const outcome = await this.page.waitForFunction(
      () => {
        if (document.body.innerText.includes('Ocurrió un error al cargar el archivo')) return 'error';
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.trim() === 'Siguiente') as HTMLButtonElement | undefined;
        return btn && !btn.disabled ? 'ready' : false;
      },
      undefined,
      { timeout: 60000 }
    ).then(handle => handle.jsonValue()).catch(() => 'timeout');

    if (outcome === 'error' || await uploadError.isVisible()) {
      throw new Error(`Falló la carga del archivo "${filePath}": el composer mostró "Ocurrió un error al cargar el archivo".`);
    }
    if (outcome === 'timeout') {
      throw new Error(`La carga del archivo "${filePath}" no terminó en 60s: "Siguiente" siguió deshabilitado.`);
    }
  }

  async publishWithVideo(text: string, videoPath: string) {
    await this.openCreatePostModal();
    await this.typePostContent(text);
    await this.attachMedia(videoPath);
    await this.nextButton.click({ timeout: 45000 });
    await this.composerFinalSubmit.waitFor({ state: 'visible', timeout: 30000 });
    await this.composerFinalSubmit.click();
  }

  async publishAsInstitution(text: string, institutionName: string | RegExp) {
    await this.openCreatePostModal();
    await this.selectDestination(institutionName);
    await this.typePostContent(text);
    await this.nextButton.click();
    await this.composerFinalSubmit.waitFor({ state: 'visible' });
    await this.composerFinalSubmit.click();
  }

  async goto() {
    await this.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.createPostButton.waitFor({ state: 'visible' });
  }

  async openCreatePostModal() {
    await this.createPostButton.click();
    // El editor tiptap tarda en inicializarse, sobre todo en Firefox y WebKit.
    await this.postEditor.waitFor({ state: 'visible', timeout: 45000 });
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

  /**
   * El botón de guardar sólo existe en publicaciones ajenas, y el feed las carga
   * de a poco al scrollear. Arriba suelen quedar las publicaciones propias (que
   * no se pueden guardar), así que hay que bajar hasta que aparezca la primera.
   */
  async revealFirstSaveButton() {
    await this.scrollUntilVisible(this.firstSaveButton);
    await this.firstSaveButton.scrollIntoViewIfNeeded().catch(() => {});
  }

  /**
   * Varios módulos del feed se montan recién cuando entran en viewport
   * (intersection observer), así que hay que bajar hasta que aparezcan.
   */
  async scrollUntilVisible(target: Locator, maxScrolls = 15, step = 2000) {
    for (let i = 0; i < maxScrolls; i++) {
      if (await target.isVisible().catch(() => false)) return;
      await this.page.mouse.wheel(0, step);
      await this.page.waitForTimeout(700);
    }
    await target.waitFor({ state: 'visible', timeout: 15000 });
  }

  async toggleFirstSave() {
    await this.firstSaveButton.click();
  }

  async openRepostModal() {
    await this.firstRepostButton.waitFor({ state: 'visible', timeout: 20000 });
    await this.firstRepostButton.scrollIntoViewIfNeeded().catch(() => {});
    // Feed content lazy-loads and the icon buttons can briefly steal the click.
    // Retry the click if the modal doesn't appear in time.
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.firstRepostButton.click();
      try {
        await this.repostModalHeading.waitFor({ state: 'visible', timeout: 8000 });
        return;
      } catch {
        // fallthrough and retry
      }
    }
    await this.repostModalHeading.waitFor({ state: 'visible', timeout: 15000 });
  }
}
