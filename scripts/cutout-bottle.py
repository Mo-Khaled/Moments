"""Cut a bottle photo shot on a flat light background into a transparent WebP, on COPIES (the source is never changed).
  python scripts/cutout-bottle.py <source> <out-basename> [--bg 239]
How: background = pixels connected to the image border that are close to the background grey (flood fill), so light parts INSIDE
the bottle (labels) stay opaque; the contact shadow under the base is background-like and is removed (the hero draws its own
shadow). The 2px edge band gets a soft alpha from the distance to the background and its colour is de-contaminated
(F = (C - (1 - a) * B) / a), so no grey halo shows on plum, nude or pearl. Output: <out>.webp (native size, cropped with a
small margin) and <out>-sm.webp (half height), plus <out>-check.png showing the cut-out on plum, nude and pearl.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
BG = float(sys.argv[sys.argv.index('--bg') + 1]) if '--bg' in sys.argv else 239.0
rgb = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
L = rgb.mean(2)
h, w = L.shape

# 1. background by flood fill from the border through pixels lighter than the bottle (bottle <= ~170, shadow 190-235)
bgish = L > 186
# the photo's contact shadow touches the base. It is a smooth grey (150-235) while the bottle is textured, so near the base a
# light pixel with little local texture (3x3 standard deviation under 6) counts as background too
from scipy.ndimage import uniform_filter
texture = np.sqrt(np.maximum(uniform_filter(L * L, 3) - uniform_filter(L, 3) ** 2, 0))
dark_rows = np.nonzero((L < 120).sum(1) > 3)[0]
base = dark_rows.max()
near = np.zeros_like(bgish); near[base - 20:, :] = True
bgish |= near & (L > 150) & (texture < 6)
bg = np.zeros_like(bgish)
q = deque()
for y in range(h):
    for x in (0, w - 1):
        if bgish[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
for x in range(w):
    for y in (0, h - 1):
        if bgish[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
        if 0 <= ny < h and 0 <= nx < w and bgish[ny, nx] and not bg[ny, nx]:
            bg[ny, nx] = True; q.append((ny, nx))
fg = ~bg

# keep only the largest blob (drops specks)
lab = np.zeros((h, w), np.int32); sizes = [0]; n = 0
for y0, x0 in zip(*np.nonzero(fg)):
    if lab[y0, x0]: continue
    n += 1; lab[y0, x0] = n; q = deque([(y0, x0)]); s = 0
    while q:
        y, x = q.popleft(); s += 1
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not lab[ny, nx]:
                lab[ny, nx] = n; q.append((ny, nx))
    sizes.append(s)
fg = lab == int(np.argmax(sizes))

# 2. soft edge: 2px band either side of the boundary
m = Image.fromarray((fg * 255).astype(np.uint8))
inner = np.asarray(m.filter(ImageFilter.MinFilter(5))) > 0
outer = np.asarray(m.filter(ImageFilter.MaxFilter(3))) > 0
band = outer & ~inner
alpha = fg.astype(np.float32)
soft = np.clip((BG - L) / (BG - 150.0), 0, 1)
alpha[band] = soft[band]
alpha[inner] = 1.0
a = alpha[..., None]
fgc = np.where(a > 0.02, (rgb - (1 - a) * BG) / np.maximum(a, 0.02), 0)
fgc = np.clip(fgc, 0, 255)
rgba = np.dstack([fgc, alpha * 255]).astype(np.uint8)

ys, xs = np.nonzero(alpha > 0.02)
pad = 6
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, w), min(ys.max() + pad + 1, h))
img = Image.fromarray(rgba, 'RGBA').crop(box)
img.save(f'{out}.webp', 'WEBP', quality=86, method=6, exact=False)
img.resize((img.width // 2, img.height // 2), Image.LANCZOS).save(f'{out}-sm.webp', 'WEBP', quality=86, method=6)

# 3. check sheet on the three brand backgrounds
sheet = Image.new('RGB', (img.width * 3 + 40, img.height + 20), '#ffffff')
for i, colour in enumerate(['#3B1E3A', '#E9CFC8', '#FAF6F2']):
    tile = Image.new('RGB', (img.width + 10, img.height + 20), colour)
    tile.paste(img, (5, 10), img)
    sheet.paste(tile, (i * (img.width + 15), 0))
sheet.save(f'{out}-check.png')
print(out, img.size, 'box', box)
