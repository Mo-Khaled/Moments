"""Derive transparent, trimmed, single-colour (pearl) brand logos from the store's own collection images.
The collection logos are opaque PNGs with a plum background baked in, and Laverne has a dark leopard silhouette behind its
last letter. This keeps only what is clearly lighter than that background, so backgrounds and the silhouette drop out.
Originals are only read (public CDN URLs of the store's own files). Output: assets/brand-<handle>.png (96 px high).
usage: python scripts/prepare-brand-logos.py"""
import io
import json
import os
import urllib.request

import time

import numpy as np
from PIL import Image

CDN = "https://cdn.shopify.com/s/files/1/0791/3917/6639/collections/"
# collection handle -> the store's own collection image file (read from /collections/<handle>.json)
FILES = {"afnan": "afnan", "khadlaj": "khadlaj", "lattafa": "lattafa", "faan": "faan", "assaf": "assaf", "rasasi-perfumes": "rasasi",
         "laverne": "laverne", "nabeel-perfumes": "nabeel", "ibraq": "ibraq-ibrahim-alqurashi", "le-falcone": "le-falcone",
         "lattafa-pride": "pride", "armaf": "armaf", "zimaya": "zimaya", "dkhoon-emirates": "dkhoon-alemiratia"}
HANDLES = list(FILES)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
PEARL = (250, 246, 242)
meta = {}


def get(url):
    for wait in (0, 4, 10, 20):
        time.sleep(wait)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503):
                raise
    raise RuntimeError("rate limited: " + url)


for h in HANDLES:
    src = f"{CDN}{FILES[h]}.png?width=1600"
    im = Image.open(io.BytesIO(get(src))).convert("RGBA")
    a = np.asarray(im).astype(float)
    luma = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    ring = np.concatenate([luma[:6].ravel(), luma[-6:].ravel(), luma[:, :6].ravel(), luma[:, -6:].ravel()])
    bg = float(np.median(ring))
    alpha = np.clip((luma - bg - 30) / (170 - 30), 0, 1)
    alpha = alpha * (a[..., 3] / 255.0)
    mask = alpha > 0.12
    ys, xs = np.where(mask)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    out = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = PEARL
    out[..., 3] = (alpha * 255).astype(np.uint8)
    img = Image.fromarray(out, "RGBA").crop(box)
    s = 96 / img.height
    img = img.resize((max(1, round(img.width * s)), 96), Image.LANCZOS)
    path = os.path.join(OUT, f"brand-{h}.png")
    img.save(path, optimize=True)
    meta[h] = {"w": img.width, "h": img.height, "aspect": round(img.width / img.height, 2), "kb": round(os.path.getsize(path) / 1024, 1), "bg_luma": round(bg)}
    print(h, meta[h])
json.dump(meta, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "brand-logos.json"), "w"), indent=1)
