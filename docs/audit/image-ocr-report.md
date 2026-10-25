# Image review and OCR pass for other-store traces (nothing edited)

Your decision 6: review all gift and bag images at full size, then OCR every product and slide image for HARAMAIN, الحرمين, حرمين, 2002 and haramaineg. No image was edited.

## Tool note

Tesseract could not be installed here (no winget; Chocolatey needs an administrator shell). I used the **Windows 11 built-in OCR engine** (`Windows.Media.Ocr`, Arabic `ar-SA` and English `en-US` language packs are installed) and Pillow in a scratch virtualenv for image enhancement. Both are dev tools only; nothing was added to the theme. The scripts and the downloaded images stayed in the temporary scratch folder, outside the repository.

## What was covered

| Set | Images |
|---|---|
| All product images on the 767 active products (width 1200) | 1,650 |
| Collection images, homepage slides and tiles, images rendered on 19 key pages | 547 |
| The 20 brand logo files uploaded on 18 Oct (width 2400) | 20 |
| **Total OCR'd** | **2,217** (one retried after a failed download) |
| Passes per image | 3 variants (original, contrast-stretched, high-pass that removes the background and amplifies faint marks) x 2 languages = 6 reads per image, 13,300 reads, 0 failures |
| Not covered | The 51 draft products (not public), any image not on a page or product at the time, and images in apps, emails or checkout |

## Result of the OCR

| Hit | Image | Product | What it read |
|---|---|---|---|
| Fragment `NE FRAG ... SIN 2002` | `ibraq1bag.png` (image 1) | `ibraq-premium-gift-bag-large` | High-pass read: "NE FRAG CES - SIN 2002" (the watermark "FINE FRAGRANCES - SINCE 2002") |
| Fragment `FINE F ... NCES - 2002` | `ibraq-2-bag.png` (image 2) | same | High-pass read: "FINE F ... NCES - 2002" |
| `HARAM` | three `gharam-pride` images | `gharam-pride` | **False positive**: the product is named "Gharam" (Lattafa Pride) |

No strong hit (the whole word HARAMAIN, الحرمين, a phone number or haramaineg) was read in any image.

## The OCR is not enough, so I checked by eye

OCR missed watermarks that are plainly there, because the big letters are faint and cut by the edge of the bag. So I opened every gift and bag image at full size (2000 x 2000) next to a high-pass version:

| Image | Watermark "HARAMAIN ... FINE FRAGRANCES - SINCE 2002" |
|---|---|
| `afnan-gift-bag` image 1 (`afnan-1.png`) | **Yes** |
| `afnan-gift-bag` image 2 (`afnan2.png`) | **Yes** |
| `afnan-orange-gift-bag` image 1 | **Yes** (fainter) |
| `afnan-orange-gift-bag` image 2 | **Yes** (fainter) |
| `assaf-gift-bag` image 1 (`assaf-24.png`) | **Yes** (lower front, "ARAMA... SINCE") |
| `assaf-gift-bag` image 2 (`assaf-23.png`, four-view photo) | No |
| `ibraq-premium-gift-bag-large` image 1 (`ibraq1bag.png`) | **Yes** |
| `ibraq-premium-gift-bag-large` image 2 (`ibraq-2-bag.png`) | **Yes** |

**7 of the 8 bag images carry the watermark.** You planned to replace two (`ibraq1bag.png`, `afnan-1.png`); the other five are `afnan2.png`, both orange Afnan images, `assaf-24.png` and `ibraq-2-bag.png`. Only `assaf-23.png` is clean. Those are the only 4 products in the Gift Bags collection (and the only products typed "Bag"). Evidence: `haramain-evidence/bags-full-size-original.jpg` and `bags-full-size-highpass.jpg`.

I then viewed high-pass contact sheets of **48 randomly chosen product images** (seed 7, from all brands) and of the **20 brand logo files**: no watermark, no other-store text. The brand files are plain logos on transparent backgrounds (Afnan, Armaf, Assaf, Khadlaj, Lattafa and so on). One product image (`checkmate-white-knight`) carries a small ARMAF badge in its corner; that is the brand's own mark. Evidence: `highpass-sample-24-products-a.jpg`, `highpass-sample-24-products-b.jpg`, `highpass-20-banners.jpg`.

## Honest limits

- The visual check is a sample (48 of 1,650 product images), not every image. The OCR covered every image but is blind to faint, cropped text. Together they suggest the watermark is limited to the four gift-bag products, but I can't prove no other image has one.
- If you want certainty for the whole catalogue, the next step is a full-size high-pass review of every product's first image (about 770 images, about 65 contact sheets). Say so and I will do it.
- Draft products and anything outside the storefront are unchecked.
