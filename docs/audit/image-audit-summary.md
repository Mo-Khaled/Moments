# Product image audit: summary

Read-only. Source: the store's public product feed (`/products.json`), HEAD requests for file size, and 480 px thumbnails of image
positions 1 and 2 for pixel measurements. Nothing was written to the store. Full data: [image-audit.csv](image-audit.csv) (one row per image).

**Coverage.** All 767 active products are in it (the feed returned 250 + 250 + 250 + 17; every active product is published to the Online
Store, checked with the Admin API counts: 767 active, 767 published, 0 unpublished). One product has no image (listed in the gap list).
The 51 draft products are not in the feed and are not audited. Correction: an earlier message of mine said "517 of 767"; that was an
addition mistake. **Alt text:** the public feed returns none, so alt text is not measured here (the earlier Admin-based audit counted 538
alts naming another shop and 331 blank; the rewrite is a separate, approved-later store step).

## Headline numbers (main image of 766 products with images)
| Measure | Result |
| --- | --- |
| Long side under 1000 px | **52** products (blurry on retina and in a large hero or tile) |
| Long side 1000 to 1999 px | 412 (below the 2000 px standard) |
| Long side 2000 px or more | 302 (meets the size standard) |
| Median long side | 1600 px |
| Odd aspect ratio (not square, not 4:5) | 189 |
| Bottle cropped by the frame edge | **46** |
| Bottle under 55% of the frame height | 59 |
| Bottle fills over 93% of the frame | 21 |
| Heavier than 900 KB | 101 (237 across all images; total 795 MB) |
| File under 25 KB (likely heavily compressed) | 26 |
| Background: white / light grey or tint / dark or colour / photo scene | 536 / 107 / 105 / 17 |
| Filename pattern that suggests the file came from elsewhere | 48 (a hint, not proof) |

Images per product: 1 image: 224 products, 2: 289, 3: 185, 4 or more: 68. 224 products have no second or lifestyle image to swap to.

## The 40 worst
[image-worst-40.png](image-worst-40.png) (contact sheet) and [image-worst-40.csv](image-worst-40.csv). Patterns: tiny sources (360 to 600 px), bottles
cropped at an edge (Khadlaj, Rasasi, Ajmal, Maison Alhambra), bottles at 30 to 50% of a tall frame (Khadlaj incense, Rasasi oud),
non-square tiles (Khadlaj 1071x1499 and 375x500). The Rare Reef tile crop you reported came from cover-cropping a normal image; tiles no longer crop products.

## What the standard needs
Square or 4:5 canvas, bottle about 80% of the frame height on a fixed baseline, soft pearl backdrop, 2000 px on the long side,
a lifestyle image second. See [../assets/normalization-samples/](../assets/normalization-samples/) for six samples and their limits:
sources under about 1200 px tall cannot be fixed by software, they need a better source image ([image-gap-list.md](../assets/image-gap-list.md)).
