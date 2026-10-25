/**
 * Gift Bag Selector
 * ------------------------------------------------------------------
 * This is an OPTIONAL choice — not a required one. Clicking a bag
 * selects it (swapping out any previously selected bag). Clicking the
 * already-selected bag again deselects it and removes it from the
 * cart entirely, so the customer isn't forced to keep one.
 *
 * `data-selected-variant` on the [data-gift-bag-selector] wrapper is
 * the source of truth for "what's currently selected" — it's rendered
 * server-side from the real cart state and refreshed automatically
 * whenever the cart section morphs, so it never gets out of sync with
 * the DOM.
 */
import { ThemeEvents, CartUpdateEvent } from '@theme/events';
import { fetchConfig } from '@theme/utilities';

/**
 * Collects the section ids the theme needs re-rendered after a cart change,
 * matching the pattern used by the theme's own cart components.
 * @returns {string}
 */
function getCartSectionIds() {
  const cartItemsComponents = document.querySelectorAll('cart-items-component');
  const sectionIds = [];
  cartItemsComponents.forEach((el) => {
    if (el instanceof HTMLElement && el.dataset.sectionId) {
      sectionIds.push(el.dataset.sectionId);
    }
  });
  return sectionIds.join(',');
}

/**
 * Dispatches the theme's cart update event so cart-items-component
 * morphs its section(s) in place.
 * @param {Response} response
 */
async function dispatchCartUpdate(response) {
  const data = await response.json();
  if (data?.sections) {
    document.dispatchEvent(
      new CartUpdateEvent({}, 'gift-bag-selector', {
        source: 'gift-bag-selector',
        sections: data.sections,
      })
    );
  }
  return data;
}

/**
 * Removes every gift-bag line item currently in the cart.
 * @param {string} sections
 * @returns {Promise<Response | null>}
 */
async function removeAllBagLines(sections) {
  const cartRes = await fetch('/cart.js');
  const cart = await cartRes.json();
  const bagItems = cart.items.filter((item) => item.properties && item.properties._gift_bag === 'true');

  let lastResponse = null;
  for (const item of bagItems) {
    lastResponse = await fetch(
      Theme.routes.cart_change_url,
      fetchConfig('json', {
        body: JSON.stringify({
          id: item.key,
          quantity: 0,
          sections,
          sections_url: window.location.pathname,
        }),
      })
    );
  }
  return lastResponse;
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', async (event) => {
    const radio = /** @type {HTMLInputElement | null} */ (event.target.closest('[data-gift-bag-radio]'));
    if (!radio) return;

    const selectorEl = radio.closest('[data-gift-bag-selector]');
    if (!(selectorEl instanceof HTMLElement)) return;

    const previousValue = selectorEl.dataset.selectedVariant || '';
    const clickedValue = radio.value;
    const sections = getCartSectionIds();

    selectorEl.classList.add('gift-bag-selector--loading');

    try {
      if (clickedValue === previousValue) {
        // Clicking the already-selected bag deselects it — remove it entirely.
        radio.checked = false;
        const response = await removeAllBagLines(sections);
        if (response) await dispatchCartUpdate(response);
      } else {
        // Swap: remove any other selected bag, then add the newly clicked one.
        await removeAllBagLines(sections);

        const response = await fetch(
          Theme.routes.cart_add_url,
          fetchConfig('json', {
            body: JSON.stringify({
              items: [
                {
                  id: clickedValue,
                  quantity: 1,
                  properties: { _gift_bag: 'true' },
                },
              ],
              sections,
              sections_url: window.location.pathname,
            }),
          })
        );
        await dispatchCartUpdate(response);
      }
    } catch (err) {
      console.error('Gift bag selector error:', err);
    } finally {
      selectorEl.classList.remove('gift-bag-selector--loading');
    }
  });
});
