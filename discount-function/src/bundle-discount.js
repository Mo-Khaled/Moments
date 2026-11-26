// MOMENTS bundle discount: 10% on the bottles of an intact bundle only.
// Shopify Discount Function logic (target cart.lines.discounts.generate.run). See ../README.md before using it.
export const MIN_BOTTLES = 3;
export const PERCENT = '10.0';
const PREFIX = 'MOMENTS bundle ';
const MESSAGE = 'خصم ١٠٪ على ٣ زجاجات · 10% off 3+ bottles';

export function cartLinesDiscountsGenerateRun(input) {
  const nothing = { operations: [] };
  if (!input.discount.discountClasses.includes('PRODUCT')) return nothing;

  // Group the eligible lines by the bundle they belong to. Loose lines and emptied labels are never grouped.
  const bundles = new Map();
  for (const line of input.cart.lines) {
    const label = line.bundle?.value ?? '';
    const eligible = line.merchandise?.product?.inAnyCollection === true;
    if (!eligible || !label.startsWith(PREFIX)) continue;
    if (!bundles.has(label)) bundles.set(label, []);
    bundles.get(label).push(line);
  }

  const targets = [...bundles.values()]
    .filter((lines) => lines.reduce((sum, line) => sum + line.quantity, 0) >= MIN_BOTTLES)
    .flat()
    .map((line) => ({ cartLine: { id: line.id } }));
  if (!targets.length) return nothing;

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [{ message: MESSAGE, targets, value: { percentage: { value: PERCENT } } }],
          selectionStrategy: 'FIRST',
        },
      },
    ],
  };
}
