"""Normalise product packshots to the MOMENTS standard, on COPIES. Nothing is uploaded and no original is touched.

Standard: 4:5 canvas 1600 x 2000 (2000 px on the long side), the bottle about 80% of the frame height, one consistent baseline
(the bottle bottom sits at 90% of the height), a soft pearl backdrop (#FAF6F2), the bottle centred.
How: the bottle is found by its difference from the photo's own background; that difference becomes a soft mask so the bottle and
its natural shadow are lifted onto the pearl backdrop; the crop is scaled so the bottle is 80% tall. A source whose bottle is under
1200 px tall is scaled UP, which cannot add detail: such samples are marked "needs a better source" in the report.

usage: python scripts/normalize-images.py [--handles h1,h2,...] [--out build/normalized] [--sheet docs/assets/normalization-samples]
Reads image URLs from docs/audit/image-audit.csv (the store's own CDN files, position 1). Needs Pillow and numpy.
"""
import argparse
import csv
import io
import json
import os
import time
import urllib.request

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PEARL = (250, 246, 242)
W, H = 1600, 2000
BOTTLE_H = 0.80
BASELINE = 0.90
DEFAULT = ["oud-muattar-samou-al-oud", "faqat-lil-rijal", "mamoul-oud-azraq", "club-de-nuit-imperiale", "9-pm-night-out", "hawas-ice"]


def fetch(url):
    for wait in (0, 4, 12):
        time.sleep(wait)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
        except Exception:
            pass
    raise RuntimeError("could not fetch " + url)


def normalise(im):
    a = np.asarray(im.convert("RGB")).astype(float)
    h, w, _ = a.shape
    ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(ring, axis=0)
    diff = np.abs(a - bg).max(axis=2)
    mask = diff > 34
    rows, cols = np.where(mask.sum(axis=1) >= 3)[0], np.where(mask.sum(axis=0) >= 3)[0]
    if len(rows) == 0:
        raise RuntimeError("no bottle found")
    top, bot, left, right = rows[0], rows[-1] + 1, cols[0], cols[-1] + 1
    bh = bot - top
    # soft alpha from the difference: the bottle and its soft shadow, over the pearl backdrop
    alpha = np.clip((diff - 10) / 40.0, 0, 1)[..., None]
    out = a * alpha + np.array(PEARL) * (1 - alpha)
    src = Image.fromarray(out.astype(np.uint8))
    scale = (H * BOTTLE_H) / bh
    new = src.crop((left, top, right, bot)).resize((max(1, round((right - left) * scale)), round(bh * scale)), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H), PEARL)
    x = (W - new.width) // 2
    y = round(H * BASELINE - new.height)
    canvas.paste(new, (x, y))
    return canvas, bh, scale, (new.width <= W)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--handles", default=",".join(DEFAULT))
    ap.add_argument("--out", default=os.path.join(ROOT, "build", "normalized"))
    ap.add_argument("--sheet", default=os.path.join(ROOT, "docs", "assets", "normalization-samples"))
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    os.makedirs(args.sheet, exist_ok=True)
    rows = {r["handle"]: r for r in csv.DictReader(open(os.path.join(ROOT, "docs", "audit", "image-audit.csv"), encoding="utf-8-sig")) if r["position"] == "1"}
    report = []
    for handle in args.handles.split(","):
        r = rows.get(handle)
        if not r:
            report.append({"handle": handle, "error": "not in the audit"})
            continue
        raw = fetch(r["src"].split("?")[0] + "?width=2400")
        before = Image.open(io.BytesIO(raw)).convert("RGB")
        after, bh, scale, fits = normalise(before)
        after.save(os.path.join(args.out, f"{handle}.jpg"), quality=90)
        # before / after sheet, same height
        b = before.copy()
        b.thumbnail((700, 875))
        a2 = after.copy()
        a2.thumbnail((700, 875))
        sheet = Image.new("RGB", (1440, 960), "white")
        sheet.paste(b, (10 + (700 - b.width) // 2, 40))
        sheet.paste(a2, (730 + (700 - a2.width) // 2, 40))
        d = ImageDraw.Draw(sheet)
        d.text((10, 8), f"BEFORE  {r['title'][:40]} ({r['vendor']})  {r['width']}x{r['height']}", fill=(0, 0, 0))
        d.text((730, 8), f"AFTER  {W}x{H}, bottle {int(BOTTLE_H * 100)}% tall" + ("  - needs a better source (upscaled %.1fx)" % scale if scale > 1.3 else ""), fill=(120, 0, 0))
        sheet.save(os.path.join(args.sheet, f"{handle}.jpg"), quality=88)
        report.append({"handle": handle, "title": r["title"], "vendor": r["vendor"], "source": f"{r['width']}x{r['height']}", "bottle_px_before": int(bh), "upscale": round(float(scale), 2), "needs_better_source": bool(scale > 1.3)})
        print(report[-1])
    json.dump(report, open(os.path.join(args.sheet, "report.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
