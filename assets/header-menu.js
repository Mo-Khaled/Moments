import { Component } from '@theme/component';
import { debounce, onDocumentLoaded } from '@theme/utilities';
import { MegaMenuHoverEvent } from '@theme/events';

const ACTIVATE_DELAY = 0;
const DEACTIVATE_DELAY = 350;

/**
 * A custom element that manages a header menu.
 *
 * @typedef {Object} State
 * @property {HTMLElement | null} activeItem - The currently active menu item.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} overflowMenu - The overflow menu.
 * @property {HTMLElement[]} [submenu] - The submenu in each respective menu item.
 *
 * @extends {Component<Refs>}
 */
class HeaderMenu extends Component {
  requiredRefs = ['overflowMenu'];

  #abortController = new AbortController();

  connectedCallback() {
    super.connectedCallback();

    this.overflowMenu?.addEventListener('pointerleave', () => this.#debouncedDeactivate(), {
      signal: this.#abortController.signal,
    });

    onDocumentLoaded(this.#preloadImages);

    // Keyboard: Escape closes and gives focus back, arrows move between items and inside the panel.
    this.addEventListener('keydown', this.#onKeydown, { signal: this.#abortController.signal });

    // Touch: the first tap on an item that owns a panel opens it, the second tap follows the link.
    this.addEventListener('pointerdown', this.#onPointerdown, { signal: this.#abortController.signal });
    // Safety net: a panel that is open while the pointer is nowhere near the menu (and focus is not inside it) is closed.
    document.addEventListener('pointermove', this.#onDocumentPointermove, { signal: this.#abortController.signal, passive: true });
    this.addEventListener('click', this.#onClick, { signal: this.#abortController.signal });
    // MOMENTS fix: when the pointer leaves the page (up into the tab bar, off the window) or the window loses focus, Chrome can keep :hover on the last
    // element and fires no pointerleave, so the panel stayed open. Close it on those signals.
    const leave = () => { this.#debouncedActivateHandler.cancel(); this.#debouncedDeactivate.cancel(); this.#deactivate(this.#state.activeItem, true); };
    document.documentElement.addEventListener('mouseleave', leave, { signal: this.#abortController.signal });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) leave(); }, { signal: this.#abortController.signal });
    window.addEventListener('blur', leave, { signal: this.#abortController.signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); }, { signal: this.#abortController.signal });
  }

  #watchdog = 0;

  /**
   * @param {PointerEvent} event
   */
  #onDocumentPointermove = (event) => {
    if (event.pointerType === 'touch' || this.#watchdog) return;
    // no active item but the panel still looks open (state lost): reset it once the pointer is away
    if (!this.#state.activeItem) {
      const stale = (parseFloat(this.style.getPropertyValue('--submenu-height')) || 0) > 0 || this.querySelector('[aria-expanded="true"]');
      if (stale && !this.matches(':hover') && !this.matches(':focus-within')) {
        this.style.setProperty('--submenu-height', '0px');
        this.style.setProperty('--submenu-opacity', '0');
        this.ariaExpanded = 'false';
        this.querySelectorAll('[aria-expanded="true"]').forEach((e) => e.setAttribute('aria-expanded', 'false'));
      }
      return;
    }

    this.#watchdog = window.setTimeout(() => {
      this.#watchdog = 0;
      if (this.#state.activeItem && !this.matches(':hover') && !this.matches(':focus-within')) this.#deactivate();
    }, 450);
  };

  // MOMENTS fix: second safety net, independent of pointer events. While a panel is open, every 250 ms check that the pointer (or focus) is still
  // inside the menu, that the stored height matches the panel, and close it when not. A panel can no longer stay half open.
  #guard = 0;

  #startGuard() {
    if (this.#guard) return;
    this.#guard = window.setInterval(() => {
      const item = this.#state.activeItem;
      if (!item) { this.#stopGuard(); return; }
      if (!this.matches(':hover') && !this.matches(':focus-within')) { this.#deactivate(); return; }
      const submenu = findSubmenu(item) ?? this.overflowMenu;
      const want = submenu ? Math.max(submenu.offsetHeight, this.overflowMenu?.offsetHeight ?? 0) : 0;
      const have = parseFloat(this.style.getPropertyValue('--submenu-height')) || 0;
      if (want && Math.abs(want - have) > 1) this.style.setProperty('--submenu-height', `${want}px`);
    }, 250);
  }

  #stopGuard() {
    window.clearInterval(this.#guard);
    this.#guard = 0;
  }

  #touchOpenedBefore = false;

  /**
   * @param {PointerEvent} event
   */
  #onPointerdown = (event) => {
    if (event.pointerType !== 'touch') return;
    const link = event.target instanceof Element ? event.target.closest('.menu-list__link') : null;
    this.#touchOpenedBefore = !!link && link.getAttribute('aria-expanded') === 'true';
  };

  /**
   * @param {MouseEvent} event
   */
  #onClick = (event) => {
    const link = event.target instanceof Element ? event.target.closest('.menu-list__link') : null;
    if (!link || !link.hasAttribute('aria-controls')) return;
    const pointerType = /** @type {PointerEvent} */ (event).pointerType;
    if (pointerType === 'touch' && !this.#touchOpenedBefore) event.preventDefault();
  };

  /**
   * @param {KeyboardEvent} event
   */
  #onKeydown = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (event.key === 'Escape') {
      const item = this.#state.activeItem;
      if (!item) return;
      this.#debouncedActivateHandler.cancel();
      this.#debouncedDeactivate.cancel();
      this.#deactivate(item, true);
      item.focus();
      event.preventDefault();
      return;
    }

    const rtl = getComputedStyle(this).direction === 'rtl';
    const link = target.closest('.menu-list__link');
    const panel = target.closest('.menu-list__submenu');

    // Top-level item: left and right move between items, down opens the panel and moves into it.
    if (link && !panel) {
      const items = [...this.querySelectorAll('.menu-list__list-item:not([slot="more"]) > .menu-list__link')];
      const index = items.indexOf(/** @type {HTMLElement} */ (link));
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const step = (event.key === 'ArrowRight') !== rtl ? 1 : -1;
        const next = items[index + step];
        if (next) { next.focus(); event.preventDefault(); }
      } else if (event.key === 'ArrowDown' && link.hasAttribute('aria-controls')) {
        const li = link.closest('li');
        this.#debouncedDeactivate.cancel();
        this.#activateHandler({ target: li });
        const first = li?.querySelector('.menu-list__submenu a');
        if (first instanceof HTMLElement) first.focus();
        event.preventDefault();
      }
      return;
    }

    // Inside a panel: up and down walk its links in reading order.
    if (panel && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      const links = [...panel.querySelectorAll('a')];
      const index = links.indexOf(/** @type {HTMLAnchorElement} */ (target.closest('a')));
      const next = links[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (next) { next.focus(); event.preventDefault(); }
    }
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  /**
   * @type {State}
   */
  #state = {
    activeItem: null,
  };

  /**
   * Time to allow for a closing animation between initiating a deactivation and actually deactivating the active item.
   * @returns {number}
   */
  get animationDelay() {
    const value = this.dataset.animationDelay;
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Get the overflow menu
   */
  get overflowMenu() {
    return /** @type {HTMLElement | null} */ (this.refs.overflowMenu?.shadowRoot?.querySelector('[part="overflow"]'));
  }

  /**
   * Whether the overflow menu is hovered
   * @returns {boolean}
   */
  get overflowHovered() {
    return this.refs.overflowMenu?.matches(':hover') ?? false;
  }

  /**
   * Activate the selected menu item immediately
   * @param {PointerEvent | FocusEvent} event
   */
  activate = (event) => {
    this.#debouncedDeactivate.cancel();
    this.#debouncedActivateHandler.cancel();

    this.#debouncedActivateHandler(event);
  };

  /**
   * Activate the selected menu item with a delay
   * @param {PointerEvent | FocusEvent} event
   */
  #activateHandler = (event) => {
    this.#debouncedDeactivate.cancel();

    this.dispatchEvent(new MegaMenuHoverEvent());

    this.removeAttribute('data-animating');

    if (!(event.target instanceof Element)) return;

    let item = findMenuItem(event.target);

    if (!item || item == this.#state.activeItem) return;

    const isDefaultSlot = event.target.slot === '';

    this.dataset.overflowExpanded = (!isDefaultSlot).toString();

    const previouslyActiveItem = this.#state.activeItem;

    if (previouslyActiveItem) {
      previouslyActiveItem.ariaExpanded = 'false';
    }

    this.#state.activeItem = item;
    this.ariaExpanded = 'true';
    item.ariaExpanded = 'true';

    let submenu = findSubmenu(item);
    let overflowMenuHeight = this.overflowMenu?.offsetHeight ?? 0;

    if (!submenu && !isDefaultSlot) {
      submenu = this.overflowMenu;
    }

    const submenuHeight = submenu ? Math.max(submenu.offsetHeight, overflowMenuHeight) : 0;

    this.style.setProperty('--submenu-height', `${submenuHeight}px`);
    this.style.setProperty('--submenu-opacity', '1');
    this.#startGuard();

    // MOMENTS fix: the height is read once, at activation. When the panel's images or fonts had not laid out yet it read a few dozen pixels, and the header
    // stayed open at that height with the tiles cut off (a sliver under the header). Keep the height in step with the panel while it is open.
    this.#heightObserver?.disconnect();
    if (submenu && typeof ResizeObserver === 'function') {
      this.#heightObserver = new ResizeObserver(() => {
        if (this.#state.activeItem !== item) return;
        this.style.setProperty('--submenu-height', `${Math.max(submenu.offsetHeight, this.overflowMenu?.offsetHeight ?? 0)}px`);
      });
      this.#heightObserver.observe(submenu);
    }
  };

  #heightObserver = null;

  #debouncedActivateHandler = debounce(this.#activateHandler, ACTIVATE_DELAY);

  /**
   * Deactivate the active item after a delay
   * @param {PointerEvent | FocusEvent} event
   */
  deactivate(event) {
    this.#debouncedActivateHandler.cancel();

    if (!(event.target instanceof Element)) return;

    const item = findMenuItem(event.target);

    // MOMENTS fix: the panel must close when the pointer leaves ANY nav item while a panel is open. The original only closed when the item being
    // left was the active one, so sliding from one item to the next and out again before the next item's (delayed) activation ran left the
    // first panel open for good (activate() had cancelled its pending close, and the item just left was never active).
    if (this.#state.activeItem && (item === this.#state.activeItem || item !== this.#state.activeItem)) {
      this.#debouncedDeactivate();
    }
  }

  /**
   * Deactivate the active item immediately
   * @param {HTMLElement | null} [item]
   * @param {boolean} [force] - Close even while the pointer is over the overflow panel (Escape).
   */
  #deactivate = (item = this.#state.activeItem, force = false) => {
    if (!item || item != this.#state.activeItem) return;
    if (!force && this.overflowHovered) return;

    this.#stopGuard();
    this.#heightObserver?.disconnect();
    this.style.setProperty('--submenu-height', '0px');
    this.style.setProperty('--submenu-opacity', '0');
    this.dataset.overflowExpanded = 'false';

    this.#state.activeItem = null;
    this.ariaExpanded = 'false';
    item.ariaExpanded = 'false';
    item.setAttribute('data-animating', '');

    setTimeout(() => {
      item.removeAttribute('data-animating');
    }, Math.max(0, this.animationDelay - 150)); // Start header transition 150ms before submenu finishes
  };

  /**
   * Deactivate the active item after a delay
   * @param {PointerEvent | FocusEvent} event
   */
  #debouncedDeactivate = debounce(this.#deactivate, DEACTIVATE_DELAY);

  /**
   * Preload images that are set to load lazily.
   */
  #preloadImages = () => {
    const images = this.querySelectorAll('img[loading="lazy"]');
    images?.forEach((image) => image.removeAttribute('loading'));
  };
}

if (!customElements.get('header-menu')) {
  customElements.define('header-menu', HeaderMenu);
}

/**
 * Find the closest menu item.
 * @param {Element | null | undefined} element
 * @returns {HTMLElement | null}
 */
function findMenuItem(element) {
  if (!(element instanceof Element)) return null;

  if (element?.matches('[slot="more"')) {
    // Select the first overflowing menu item when hovering over the "More" item
    return findMenuItem(element.parentElement?.querySelector('[slot="overflow"]'));
  }

  return element?.querySelector('[ref="menuitem"]');
}

/**
 * Find the closest submenu.
 * @param {Element | null | undefined} element
 * @returns {HTMLElement | null}
 */
function findSubmenu(element) {
  const submenu = element?.parentElement?.querySelector('[ref="submenu[]"]');
  return submenu instanceof HTMLElement ? submenu : null;
}
