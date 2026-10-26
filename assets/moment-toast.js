import { CartAddEvent } from '@theme/events';

/**
 * Small confirmation after an item is added to the cart (cart type "page", where nothing else tells the shopper it worked):
 * "Added to cart", a View cart link and a Check out link. It appears when the theme fires a CartAddEvent, stays 5 seconds
 * (paused while the pointer or focus is inside), never takes focus, and is announced politely. Only an add shows it, not a quantity change.
 */
class MomentToast extends HTMLElement {
  #timer = 0;

  connectedCallback() {
    document.addEventListener(CartAddEvent.eventName, this.#onEvent);
    this.addEventListener('pointerenter', this.#pause);
    this.addEventListener('pointerleave', this.#arm);
    this.addEventListener('focusin', this.#pause);
    this.addEventListener('focusout', this.#arm);
    this.querySelector('[data-toast-close]')?.addEventListener('click', () => this.#hide());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.hasAttribute('data-open')) this.#hide(); });
  }

  disconnectedCallback() {
    document.removeEventListener(CartAddEvent.eventName, this.#onEvent);
    clearTimeout(this.#timer);
  }

  /** @param {Event} event */
  #onEvent = (event) => {
    if (!(event instanceof CartAddEvent)) return;
    if (event.detail?.data?.didError) return;
    this.#show();
  };

  #show() {
    this.removeAttribute('hidden');
    // next frame so the entry transition runs
    requestAnimationFrame(() => this.setAttribute('data-open', ''));
    this.#arm();
  }

  #hide() {
    clearTimeout(this.#timer);
    this.removeAttribute('data-open');
    setTimeout(() => { if (!this.hasAttribute('data-open')) this.setAttribute('hidden', ''); }, 260);
  }

  #pause = () => clearTimeout(this.#timer);

  #arm = () => {
    clearTimeout(this.#timer);
    this.#timer = window.setTimeout(() => this.#hide(), 5000);
  };
}

if (!customElements.get('moment-toast')) customElements.define('moment-toast', MomentToast);
