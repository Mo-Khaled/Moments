# Stricter bundle discount: plan (nothing in Shopify has been changed)

**Owner decision, 2026-11-26:** keep today's discount (option D). Revisit option A after the first real orders.

**Rule:** 10% only on the bottles of an intact "Make a bundle" bundle (3 or more with the same `Bundle` label, from the
"Bundle perfumes" collection). Loose bottles and former bundle bottles get nothing. Free delivery over LE 3,000 stays.

Today's automatic discount `10% off 3+ bottles` (`gid://shopify/DiscountAutomaticNode/1523759710399`) counts bottles
across the whole cart and cannot read line properties, so it cannot express this rule.

## What the Basic plan allows (checked 2026-11-26)

- A **custom** app with a discount function works only on Shopify Plus:
  "Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs."
  ([Shopify Functions](https://shopify.dev/docs/apps/build/functions))
- A **public** App Store app with functions works on any plan (same page).

So the code in this folder cannot be installed on the store as a private app.

## Options

| Option | Cost | Rule it gives | Effort and risk |
|---|---|---|---|
| A. A public app that builds discount functions from conditions | [NERD Discount/Bundle Functions](https://apps.shopify.com/nerd-functions): 29 USD a month or 299 a year, 7 day trial, "any Shopify plan", mentions line item properties | Close: see below | Small, but the listing does not confirm the exact conditions. A young app (launched 2026-04-30, 12 reviews) |
| B. Our own public app, hidden listing, holding this folder's function | [19 USD once](https://shopify.dev/docs/apps/launch/distribution/revenue-share); no monthly fee for a function only app is expected, not confirmed | Exact | Large: it needs Shopify's app review, a listing and support pages; time unknown |
| C. Shopify Plus | A different plan, far more expensive | Exact | Not worth it for this |
| D. Keep today's discount | Nothing | 10% whenever the cart has 3 collection bottles | None. It matches the advertised "10% off 3+ bottles" |

**Recommendation:** D until there are real orders, then A if the leak matters. The leak is 10% on at most two ex bundle
bottles (LE 375 on the two in the test cart), only for someone who also has enough other bottles to total three.
If you want the strict rule now, do A.

### Why option A can be enough

The theme (live since 2026-11-26) empties the `Bundle` label the moment a bundle drops below 3. So "has a label starting
`MOMENTS bundle`" already means "belongs to an intact bundle", and the app does not have to count per bundle. It only
has to: match those lines, require 3 or more among them, give 10% to those lines only, and combine with the free
delivery discount. What this does not cover: a cart changed outside the website's pages between the removal and checkout.

Ask the developer before paying:

> Our store is on the Basic plan. We need one automatic discount: 10% off only the cart lines that have a line item
> property named Bundle whose value starts with "MOMENTS bundle", from one collection, only when those matched lines
> total 3 or more units. Other lines must not count and must not be discounted. It must combine with our free shipping
> discount. Can your app do exactly this, and on which pricing plan?

## What changes for customers (decide before switching)

- Three perfumes added the ordinary way, without "Make a bundle", would no longer get 10%.
- The wording "10% off every bottle from 3 bottles" and the discount's title become untrue. The bundle page, cart and any
  banner must say the 10% is for bundles made with "Make a bundle". Claude changes the theme wording at the switch, after
  you approve the new text.
- The mobile app has no bundle builder; it sends people to the website's page, so nothing changes there.

## Your steps (option A)

1. Send the question above from the app listing's support contact. Stop if the answer is not a clear yes.
2. Shopify admin, App Store: search "NERD Discount/Bundle Functions", **Install**. Read the permissions and price on the
   approval screen; accepting them is your decision.
3. In the app create one discount with these values: percentage 10; lines: property `Bundle` starts with
   `MOMENTS bundle`; collection "Bundle perfumes"; minimum 3 units among the matched lines; combines with shipping
   discounts. **Give it a start date in the future** so it is saved but not running. (The app's own screens are not
   documented publicly, so the field names may differ.)
4. Tell Claude it is saved.

## Test, then switch (only when you say "switch")

The two discounts cannot be tested side by side, because the old one would hide what the new one does. Before launch the
store has no real orders, so the switch is also the test, in a quiet moment:

1. Shopify admin, **Discounts**, the new discount: set its start to now (**Save**).
2. Straight after, **Discounts**, `10% off 3+ bottles`, **Deactivate**. Do not delete it.
3. Check, without ordering: a bundle of 3 gets 10% and free delivery counts as before; two ex bundle bottles plus one
   loose bottle get nothing; three loose bottles get nothing; a bundle plus a loose bottle discounts the bundle only.
   Look at the totals on the cart page.

**Rollback:** Discounts, `10% off 3+ bottles`, **Activate**; then open the new discount, **Deactivate**.

## This folder (option B, or Plus)

- `src/bundle-discount.js`: the rule, counting each bundle separately. `src/input.graphql`: what the function reads.
- `npm test` (Node only, nothing to install).
- Not done, because it needs Shopify's CLI to download packages and an app to exist: the extension configuration,
  type generation and the build. The query's line `attribute(key:)` must be confirmed by that type generation.
