# Image gap list and photography spec

Which products to shoot or request first. **Order data was not available** (the analytics query returned no sales rows for this store),
so the order is: 1) products with no image, 2) products in the **Best sellers** collection (23 products; 4 of them have a problem),
3) everyone else, worst first. Full list with reasons: [image-gap-list.csv](image-gap-list.csv) (221 products).

Products with no image at all: Dolby.

## Shoot with a phone and a plain backdrop
1. **Backdrop:** a sheet of plain off-white or light grey card or paper, curved up behind the bottle (no seam line). Matte, not glossy.
2. **Light:** a window with soft daylight, bottle side-on to the window, a white card opposite to bounce light back. No flash, no overhead lamps, no coloured light.
3. **Camera:** phone on a tripod or a stack of books, lens at the middle of the bottle (not looking down), standard 1x lens (not 0.5x), 2 to 3 metres away and cropped later, so the bottle does not distort. Landscape or portrait, any, we crop to 4:5.
4. **Frame:** the whole bottle and its cap in the picture with space around it (a quarter of the height above and below). Never cut the cap or the base.
5. **Shots per product:** front (required), then one angle or the box next to the bottle, and one lifestyle shot if you can (bottle on a surface with a simple prop that fits its moment).
6. **Clean:** wipe fingerprints, check the label is straight and readable, remove price stickers.
7. **File:** original full-size photo (HEIC or JPG, do not screenshot, do not send through WhatsApp which shrinks it). Name it with the product title.
8. We then run `scripts/normalize-images.py` to make the 4:5, 2000 px, pearl-backdrop version.

Brand-supplied packshots (see [media-kit-request.md](media-kit-request.md)) beat phone photos when you can get them in writing.
