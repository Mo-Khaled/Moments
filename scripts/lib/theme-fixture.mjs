// Local Shopify-like Liquid renderer for theme checks: the real sections and snippets rendered with liquidjs, Shopify filters and tags
// stubbed (t from locales/en.default.json, image_url/image_tag, money, asset_url served from /assets). Nothing talks to the store.
import { Liquid, Tag } from 'liquidjs';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

export const ROOT = new URL('../..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
export const css = [];
const stripComment = (s) => s.replace(/^﻿?\s*\/\*[\s\S]*?\*\//, '');
const en = JSON.parse(stripComment(readFileSync(join(ROOT, 'locales/en.default.json'), 'utf8')));
const lookup = (key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), en);

export const engine = new Liquid({ root: [join(ROOT, 'sections'), join(ROOT, 'snippets')], extname: '.liquid', dynamicPartials: true, jsTruthy: false });
// liquidjs passes keyword args as [key, value] pairs after the input
engine.registerFilter('t', function (key, ...pairs) {
  const args = Object.fromEntries(pairs.filter(Array.isArray));
  const s = lookup(key);
  if (typeof s !== 'string') return `translation missing: ${key}`;
  return s.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in args ? args[k] : m));
});
engine.registerFilter('image_url', (img, ...pairs) => (img && img.src) || '');
engine.registerFilter('image_tag', (src, ...pairs) => {
  const a = Object.fromEntries(pairs.filter(Array.isArray));
  return `<img src="${src}" alt="${a.alt ?? ''}" class="${a.class ?? ''}" loading="${a.loading ?? 'lazy'}" width="640" height="640">`;
});
engine.registerFilter('money', (cents) => `LE ${(Number(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
engine.registerFilter('json', (v) => JSON.stringify(v));
engine.registerFilter('asset_url', (f) => `/assets/${f}`);
engine.registerFilter('stylesheet_tag', (u) => `<link rel="stylesheet" href="${u}">`);
engine.registerFilter('inline_asset_content', (f) => readFileSync(join(ROOT, 'assets', f), 'utf8'));
const block = (render) =>
  class extends Tag {
    constructor(token, remain, liquid, parser) {
      super(token, remain, liquid);
      this.tpl = [];
      const name = token.name;
      const stream = parser.parseStream(remain).on(`tag:end${name}`, () => stream.stop()).on('template', (t) => this.tpl.push(t)).on('end', () => { throw new Error(`${name} not closed`); });
      stream.start();
    }
    *render(ctx, emitter) {
      const html = yield this.liquid.renderer.renderTemplates(this.tpl, ctx);
      emitter.write(render(html, ctx));
    }
  };
// schema, doc, stylesheet and javascript bodies are raw text (doc examples contain {% render %} tags that must not run)
const raw = (render) =>
  class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.text = '';
      while (remain.length) {
        const t = remain.shift();
        if (t.name === `end${token.name}`) return;
        this.text += t.getText();
      }
      throw new Error(`${token.name} not closed`);
    }
    render(ctx, emitter) {
      emitter.write(render(this.text));
    }
  };
engine.registerTag('schema', raw(() => ''));
engine.registerTag('doc', raw(() => ''));
engine.registerTag('stylesheet', raw((h) => (css.push(h), '')));
engine.registerTag('javascript', raw(() => ''));
engine.registerTag('form', block((h) => `<form method="post" action="/cart/add">${h}</form>`));
engine.registerTag('paginate', block((h) => h));

/** Serves the given html pages and theme assets on localhost. Returns { base, close }. */
export function serve(pages) {
  const types = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (pages[url.pathname]) return res.writeHead(200, { 'content-type': 'text/html' }).end(pages[url.pathname]);
    const file = join(ROOT, url.pathname);
    if (url.pathname.startsWith('/assets/') && existsSync(file)) return res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
    res.writeHead(404).end('not found');
  }).listen(0);
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
