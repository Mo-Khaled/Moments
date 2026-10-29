// DRY RUN ONLY. Prints the metafield definitions and the product values the gift finder would write. It makes no network call and has no
// write mode: the store is changed only after the owner approves in chat (docs/gift-finder.md, "Tagging products").
//   node scripts/gift-metafields-dry-run.mjs [scripts/gift-metafields-template.csv]
import { readFileSync } from 'node:fs';

const NS = 'moments';
const FEEL = ['fresh', 'warm', 'sweet', 'woody', 'clean'];
const WHO = ['her', 'him', 'mother', 'father', 'friend', 'colleague', 'partner'];
const OCCASION = ['birthday', 'anniversary', 'eid', 'thank_you', 'wedding', 'new_baby'];
const choices = (list) => [{ name: 'choices', value: JSON.stringify(list) }];

const DEFINITIONS = [
  { key: 'gift_feel', name: 'Gift: feel', type: 'single_line_text_field', validations: choices(FEEL) },
  { key: 'gift_strength', name: 'Gift: strength (1-5)', type: 'number_integer', validations: [{ name: 'min', value: '1' }, { name: 'max', value: '5' }] },
  { key: 'gift_who', name: 'Gift: who it suits', type: 'list.single_line_text_field', validations: choices(WHO) },
  { key: 'gift_occasion', name: 'Gift: occasions', type: 'list.single_line_text_field', validations: choices(OCCASION) },
  { key: 'gift_safe', name: 'Gift: easy to like', type: 'boolean', validations: [] },
  { key: 'gift_why', name: 'Gift: one reason', type: 'single_line_text_field', validations: [{ name: 'max', value: '90' }] },
  { key: 'gift_ready', name: 'Gift: gift-ready', type: 'boolean', validations: [] },
].map((d) => ({ ...d, namespace: NS, ownerType: 'PRODUCT', access: { storefront: 'PUBLIC_READ' } }));

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const list = (value) => value.split('|').map((x) => x.trim()).filter(Boolean);
const file = process.argv[2] || new URL('./gift-metafields-template.csv', import.meta.url);
const records = parseCsv(readFileSync(file, 'utf8'));

console.log('== Metafield definitions that would be created (namespace "moments", products) ==');
for (const d of DEFINITIONS) console.log(`  ${d.namespace}.${d.key}  ${d.type}  ${d.validations.map((v) => `${v.name}=${v.value}`).join(' ') || '(no validation)'}`);

const writes = [], errors = [];
let untagged = 0;
for (const r of records) {
  const filled = ['gift_feel', 'gift_strength', 'gift_who', 'gift_occasion', 'gift_safe', 'gift_why'].some((k) => r[k]);
  if (!filled) { untagged++; continue; }
  const problems = [];
  if (!FEEL.includes(r.gift_feel)) problems.push(`gift_feel must be one of ${FEEL.join('|')}`);
  const strength = Number(r.gift_strength);
  if (!Number.isInteger(strength) || strength < 1 || strength > 5) problems.push('gift_strength must be 1 to 5');
  const who = list(r.gift_who), occasion = list(r.gift_occasion);
  if (who.some((x) => !WHO.includes(x))) problems.push(`gift_who values: ${WHO.join('|')} (separate with |)`);
  if (occasion.some((x) => !OCCASION.includes(x))) problems.push(`gift_occasion values: ${OCCASION.join('|')} (separate with |)`);
  if (r.gift_safe && !['true', 'false'].includes(r.gift_safe.toLowerCase())) problems.push('gift_safe must be true or false');
  if (!r.gift_why || r.gift_why.length > 90) problems.push('gift_why is required and at most 90 characters');
  if (problems.length) { errors.push(`${r.handle}: ${problems.join('; ')}`); continue; }
  const m = (key, type, value) => ({ ownerId: `<id of product "${r.handle}">`, namespace: NS, key, type, value });
  const set = [m('gift_feel', 'single_line_text_field', r.gift_feel), m('gift_strength', 'number_integer', String(strength)), m('gift_why', 'single_line_text_field', r.gift_why)];
  if (who.length) set.push(m('gift_who', 'list.single_line_text_field', JSON.stringify(who)));
  if (occasion.length) set.push(m('gift_occasion', 'list.single_line_text_field', JSON.stringify(occasion)));
  if (r.gift_safe) set.push(m('gift_safe', 'boolean', r.gift_safe.toLowerCase()));
  writes.push({ handle: r.handle, set });
}

console.log(`\n== Product values that would be written (metafieldsSet) ==`);
for (const w of writes) {
  console.log(`  ${w.handle}`);
  for (const s of w.set) console.log(`    ${s.namespace}.${s.key} (${s.type}) = ${s.value}`);
}
console.log(`\nSummary: ${records.length} rows, ${writes.length} ready to write, ${untagged} left empty (excluded from the gift finder), ${errors.length} with problems.`);
for (const e of errors) console.log(`  PROBLEM ${e}`);
console.log('DRY RUN: nothing was sent to the store.');
process.exit(errors.length ? 1 : 0);
