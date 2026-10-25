"""Compare two snapshot labels made by scripts/visual-snapshot.mjs, pixel by pixel.
usage: python scripts/visual-diff.py <labelA> <labelB> [--tolerance 0]
Exit 1 if any image differs by more than the tolerance (in changed pixels). Needs Pillow and numpy."""
import os
import sys

import numpy as np
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
tol = 0
if "--tolerance" in sys.argv:
    tol = int(sys.argv[sys.argv.index("--tolerance") + 1])
a, b = args[:2]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "screenshots", "cleanup")
da, db = os.path.join(root, a), os.path.join(root, b)
names = sorted(set(os.listdir(da)) & set(os.listdir(db)))
bad = 0
for n in names:
    if not n.endswith(".png"):
        continue
    ia, ib = Image.open(os.path.join(da, n)).convert("RGB"), Image.open(os.path.join(db, n)).convert("RGB")
    if ia.size != ib.size:
        print(f"DIFF {n}: size {ia.size} vs {ib.size}")
        bad += 1
        continue
    diff = (np.abs(np.asarray(ia).astype(int) - np.asarray(ib).astype(int)).sum(axis=2) > 0)
    cnt = int(diff.sum())
    if cnt > tol:
        ys, xs = np.where(diff)
        print(f"DIFF {n}: {cnt} pixels, box x {xs.min()}-{xs.max()} y {ys.min()}-{ys.max()}")
        bad += 1
print(f"{len(names)} images compared, {bad} differ" if bad else f"{len(names)} images compared, zero visual difference")
sys.exit(1 if bad else 0)
