import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cartLinesDiscountsGenerateRun as run } from '../src/bundle-discount.js';

let n = 0;
const line = (quantity, bundle, eligible = true) => ({
  id: `line-${++n}`,
  quantity,
  bundle: bundle === undefined ? null : { value: bundle },
  merchandise: { __typename: 'ProductVariant', product: { inAnyCollection: eligible } },
});
const A = 'MOMENTS bundle AAAAAA';
const B = 'MOMENTS bundle BBBBBB';
const discounted = (lines, discountClasses = ['PRODUCT']) => {
  const out = run({ cart: { lines }, discount: { discountClasses } });
  const ids = out.operations[0]?.productDiscountsAdd.candidates[0].targets.map((t) => t.cartLine.id) ?? [];
  return lines.map((l) => ids.includes(l.id));
};

test('a bundle of three gets the discount, a loose bottle beside it does not', () => {
  assert.deepEqual(discounted([line(1, A), line(1, A), line(1, A), line(1)]), [true, true, true, false]);
});
test('two former bundle bottles plus one loose bottle get nothing', () => {
  assert.deepEqual(discounted([line(1, ''), line(1, ''), line(1)]), [false, false, false]);
});
test('three loose bottles get nothing', () => {
  assert.deepEqual(discounted([line(3)]), [false]);
});
test('a group of two gets nothing even if the label was not cleared', () => {
  assert.deepEqual(discounted([line(1, A), line(1, A), line(1)]), [false, false, false]);
});
test('two short groups are not added together', () => {
  assert.deepEqual(discounted([line(2, A), line(2, B)]), [false, false]);
});
test('quantity counts: two of one bottle and one of another', () => {
  assert.deepEqual(discounted([line(2, A), line(1, A)]), [true, true]);
});
test('an intact bundle keeps its discount while another is broken', () => {
  assert.deepEqual(discounted([line(3, A), line(2, B)]), [true, false]);
});
test('products outside the collection neither count nor get the discount', () => {
  assert.deepEqual(discounted([line(2, A), line(1, A, false)]), [false, false]);
  assert.deepEqual(discounted([line(3, A), line(1, A, false)]), [true, false]);
});
test('nothing when the discount is not a product discount', () => {
  assert.deepEqual(discounted([line(3, A)], ['SHIPPING']), [false]);
});
test('ten percent, one candidate', () => {
  const out = run({ cart: { lines: [line(3, A)] }, discount: { discountClasses: ['PRODUCT'] } });
  assert.equal(out.operations[0].productDiscountsAdd.candidates[0].value.percentage.value, '10.0');
  assert.equal(out.operations[0].productDiscountsAdd.candidates.length, 1);
});
