// Read-only scan of product image alt text through the public storefront feeds.
// Run in the browser console on the store's domain. It makes GET requests only.
// Output: counts, plus window.__rows = ["handle|vendor|haramainAlt|placeholderAlt|inspiredAlt", ...]
(async () => {
  const all = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`/products.json?limit=250&page=${page}&fields=handle,vendor`);
    const { products } = await res.json();
    if (!products.length) break;
    all.push(...products);
  }

  const PLACEHOLDER = /^(scale reference|3\/4 side angle|lifestyle flat lay|scent notes graphic)$/i;
  const rows = [];
  const totals = { media: 0, blank: 0, haramain: 0, placeholder: 0, inspired: 0 };

  async function scan(product) {
    const res = await fetch(`/products/${product.handle}.js`);
    const { media = [] } = await res.json();
    let h = 0, p = 0, i = 0;
    for (const m of media) {
      totals.media++;
      const alt = (m.alt || '').trim();
      if (!alt) { totals.blank++; continue; }
      if (alt.includes('الحرمين')) { totals.haramain++; h++; }
      if (PLACEHOLDER.test(alt)) { totals.placeholder++; p++; }
      if (/مستوحى|inspired/i.test(alt)) { totals.inspired++; i++; }
    }
    if (h || p || i) rows.push([product.handle, product.vendor, h, p, i].join('|'));
  }

  const queue = [...all];
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (queue.length) await scan(queue.shift());
  }));

  window.__rows = rows;
  console.log({ products: all.length, ...totals, productsAffected: rows.length });
})();
