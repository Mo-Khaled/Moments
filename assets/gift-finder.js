/**
 * Gift finder: pills, filtering, compare table and verdict. Plain custom element, no theme imports, so the homepage strip stays tiny.
 * Strip layout: "Show picks" opens the results page with the choices in the URL.
 * Page layout: loads the tagged products (all pages of the section), filters them in the browser and shows up to data-max picks.
 * Nothing here invents a value: a card is matched only on the data attributes the metafields produced.
 */
const PARAMS = ['who', 'occasion', 'budget'];
const MAX_PAGES = 6;
const MAX_COMPARE = 3;

const fill = (text, values) => text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (k in values ? values[k] : ''));
const tokens = (value) => (value || '').split(/\s+/).filter(Boolean);

class GiftFinder extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    this.layout = this.dataset.layout;
    this.max = Number(this.dataset.max) || 3;
    this.i18n = JSON.parse(this.querySelector('[data-i18n]')?.textContent || '{}');
    this.safest = false;
    this.pending = null;
    this.addEventListener('click', (event) => this.onClick(event));
    if (this.layout !== 'page') return;

    this.list = this.querySelector('[data-list]');
    this.results = this.querySelector('[data-results]');
    this.live = this.querySelector('[data-live]');
    this.addEventListener('change', (event) => event.target.matches('[data-compare]') && this.onTick(event.target));

    const query = new URLSearchParams(location.search);
    for (const name of PARAMS) {
      const value = query.get(name);
      const pill = value && this.querySelector(`[data-group="${name}"] [data-value="${CSS.escape(value)}"]`);
      if (pill) this.press(pill, true);
    }
    this.safest = query.get('safest') === '1';
    if (this.safest || PARAMS.some((name) => query.get(name))) this.run();
  }

  onClick(event) {
    const pill = event.target.closest('.gf__pill');
    if (pill) {
      this.press(pill, pill.getAttribute('aria-pressed') !== 'true');
      this.safest = false;
      return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'show') this.layout === 'page' ? this.run() : this.go(false);
    else if (action === 'safest') this.layout === 'page' ? this.run(true) : this.go(true);
    else if (action === 'reset') this.reset();
    else if (action === 'compare') this.openCompare();
    else if (action === 'close-compare') this.closeCompare();
  }

  press(pill, on) {
    const group = pill.closest('[data-group]');
    for (const other of group.querySelectorAll('.gf__pill')) other.setAttribute('aria-pressed', 'false');
    pill.setAttribute('aria-pressed', String(on));
    this.querySelector('[data-action="reset"]').hidden = !this.querySelector('.gf__pill[aria-pressed="true"]');
  }

  chosen() {
    const out = {};
    for (const name of PARAMS) {
      const pill = this.querySelector(`[data-group="${name}"] .gf__pill[aria-pressed="true"]`);
      if (pill) out[name] = pill;
    }
    return out;
  }

  go(safest) {
    const url = new URL(this.dataset.target, location.origin);
    for (const [name, pill] of Object.entries(this.chosen())) url.searchParams.set(name, pill.dataset.value);
    if (safest) url.searchParams.set('safest', '1');
    location.assign(url);
  }

  reset() {
    for (const pill of this.querySelectorAll('.gf__pill')) pill.setAttribute('aria-pressed', 'false');
    this.querySelector('[data-action="reset"]').hidden = true;
    this.safest = false;
    if (this.results) {
      this.results.hidden = true;
      this.closeCompare();
    }
    history.replaceState(null, '', location.pathname);
  }

  /** Fetches the remaining pages of tagged products once (Section Rendering API), then resolves. */
  loadAll() {
    this.pending ||= (async () => {
      for (let page = 1; page < MAX_PAGES; page++) {
        const marker = this.list.querySelector('.gp-next');
        if (!marker) break;
        const next = marker.dataset.nextUrl;
        marker.remove();
        const url = new URL(next, location.origin);
        url.searchParams.set('section_id', this.dataset.sectionId);
        try {
          const html = await (await fetch(url)).text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          for (const node of doc.querySelectorAll('[data-gift-pick], .gp-next')) this.list.append(document.importNode(node, true));
        } catch {
          break;
        }
      }
    })();
    return this.pending;
  }

  async run(safest = false) {
    this.safest = safest || this.safest;
    if (safest) for (const pill of this.querySelectorAll('.gf__pill')) pill.setAttribute('aria-pressed', 'false');
    await this.loadAll();

    const chosen = this.safest ? {} : this.chosen();
    const items = [...this.list.querySelectorAll('[data-gift-pick]')];
    const ok = (item, strict) => {
      if (strict && item.dataset.safe !== 'true') return false;
      if (chosen.who && !tokens(chosen.who.dataset.match).some((t) => tokens(item.dataset.who).includes(t))) return false;
      if (chosen.occasion && !tokens(item.dataset.occasion).includes(chosen.occasion.dataset.match)) return false;
      if (chosen.budget) {
        const [lo, hi] = chosen.budget.dataset.match.split('-');
        const price = Number(item.dataset.price);
        if (price < Number(lo) || (hi && price >= Number(hi))) return false;
      }
      return true;
    };
    // Easy-to-like picks come first, then the collection's own order.
    const rank = (list) => [...list.filter((i) => i.dataset.safe === 'true'), ...list.filter((i) => i.dataset.safe !== 'true')];
    let shown = rank(items.filter((i) => ok(i, this.safest))).slice(0, this.max);
    const empty = !shown.length;
    if (empty) shown = rank(items.filter((i) => i.dataset.safe === 'true')).slice(0, this.max);

    this.closeCompare();
    for (const item of items) {
      item.hidden = !shown.includes(item);
      item.querySelector('[data-compare]').checked = false;
    }
    shown.forEach((item, index) => (item.style.order = index));
    this.results.hidden = false;
    this.querySelector('[data-empty]').hidden = !empty || !shown.length;
    const canCompare = shown.length > 1;
    for (const label of this.querySelectorAll('[data-compare-label]')) label.hidden = !canCompare;
    this.querySelector('[data-compare-hint]').hidden = !canCompare;
    this.updateBar();

    let message;
    if (!items.length) message = this.i18n.nothing_tagged;
    else if (empty) message = this.querySelector('.gf__empty-text').textContent;
    else if (this.safest) message = this.i18n.found_safest;
    else message = fill(shown.length === 1 ? this.i18n.found_one : this.i18n.found_other, { count: shown.length });
    if (!items.length) this.querySelector('[data-empty]').hidden = true;
    this.querySelector('[data-count]').textContent = message;
    this.live.textContent = message;

    const url = new URL(location.href);
    for (const name of [...PARAMS, 'safest']) url.searchParams.delete(name);
    for (const [name, pill] of Object.entries(chosen)) url.searchParams.set(name, pill.dataset.value);
    if (this.safest) url.searchParams.set('safest', '1');
    history.replaceState(null, '', url);
  }

  ticked() {
    return [...this.list.querySelectorAll('[data-gift-pick]:not([hidden]) [data-compare]:checked')].map((box) => box.closest('[data-gift-pick]'));
  }

  onTick(box) {
    if (this.ticked().length > MAX_COMPARE) {
      box.checked = false;
      this.live.textContent = this.i18n.compare_max;
    }
    this.updateBar();
  }

  updateBar() {
    const count = this.ticked().length;
    const bar = this.querySelector('[data-compare-bar]');
    const button = this.querySelector('[data-action="compare"]');
    bar.hidden = count < 2;
    button.disabled = count < 2;
    button.textContent = fill(this.i18n.compare_button, { count });
  }

  openCompare() {
    const picks = this.ticked();
    if (picks.length < 2) return;
    const panel = this.querySelector('[data-compare-panel]');
    const table = document.createElement('table');
    table.className = 'gf__table';
    table.append(Object.assign(document.createElement('caption'), { textContent: this.i18n.compare_caption }));

    const head = table.createTHead().insertRow();
    head.append(Object.assign(document.createElement('th'), { scope: 'col', textContent: this.i18n.compare_fragrance }));
    for (const pick of picks) head.append(Object.assign(document.createElement('th'), { scope: 'col', textContent: pick.dataset.title }));

    const body = table.createTBody();
    for (const row of this.i18n.row_order) {
      const cells = picks.map((pick) => pick.querySelector(`[data-row="${row}"]`));
      if (!cells.some(Boolean)) continue;
      const tr = body.insertRow();
      tr.append(Object.assign(document.createElement('th'), { scope: 'row', textContent: this.i18n.rows[row] }));
      for (const cell of cells) {
        const td = tr.insertCell();
        const source = cell && (cell.matches('dd, p') ? cell : cell.querySelector('dd'));
        if (source) td.append(...[...source.cloneNode(true).childNodes]);
      }
    }
    this.querySelector('[data-compare-table]').replaceChildren(table);
    this.querySelector('[data-verdict]').textContent = this.verdict(picks);
    panel.hidden = false;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  closeCompare() {
    const panel = this.querySelector('[data-compare-panel]');
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    this.querySelector('[data-action="compare"]').focus();
  }

  /** One sentence from the data only: strength levels and feels. Equal values are reported as similar. */
  verdict(picks) {
    const t = this.i18n;
    const data = picks.map((p) => ({ title: p.dataset.title, strength: Number(p.dataset.strength), feel: p.dataset.feel, feelLabel: p.dataset.feelLabel.toLowerCase() }));
    const levels = data.map((d) => d.strength);
    const lo = Math.min(...levels);
    const hi = Math.max(...levels);
    const sameFeel = data.every((d) => d.feel === data[0].feel);
    if (lo === hi && sameFeel) return t.verdict_similar;
    if (lo === hi) {
      const parts = data.map((d) => fill(t.verdict_part, { title: d.title, feel: d.feelLabel })).join(', ');
      return fill(t.verdict_same_strength, { parts });
    }
    const words = (d) => (d.strength === lo ? t.verdict_lightest : d.strength === hi ? t.verdict_strongest : t.verdict_middle);
    return data.map((d) => fill(t.verdict_item, { title: d.title, strength: words(d), feel: d.feelLabel })).join('; ') + '.';
  }
}

if (!customElements.get('gift-finder')) customElements.define('gift-finder', GiftFinder);
