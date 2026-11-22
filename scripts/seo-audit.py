"""SEO audit of key pages (read-only). usage: python scripts/seo-audit.py [preview_theme_id] > report.json
Fetches each page like a browser (cookie jar, so ?preview_theme_id sticks across the redirect) and reports title, meta
description, og/twitter tags, canonical, hreflang, JSON-LD (parse check + types), H1/H2, images without alt, LCP hints."""
import html, http.cookiejar, json, re, sys, time, urllib.error, urllib.request

BASE = 'https://momentseg.com'
PAGES = {'home EN': '/', 'home AR': '/ar', 'product EN': '/products/9-pm-night-out', 'product AR': '/ar/products/9-pm-night-out',
         'collection': '/collections/night-moment', 'brand': '/collections/afnan', 'all products': '/collections/all', 'blog': '/blogs/news'}
TH = sys.argv[1] if len(sys.argv) > 1 else ''


def get(path):
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')]
    q = '?pb=0' + (f'&preview_theme_id={TH}' if TH else '')
    for attempt in range(6):
        try:
            with op.open(BASE + path + q, timeout=60) as r:
                return r.read().decode('utf-8', 'ignore'), r.status
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(20 * (attempt + 1))
    raise RuntimeError('still 429')


def meta(s, attr, name):
    m = re.search(rf'<meta\s+{attr}="{re.escape(name)}"\s+content="([^"]*)"', s) or re.search(rf'<meta\s+content="([^"]*)"\s+{attr}="{re.escape(name)}"', s)
    return html.unescape(m.group(1)) if m else None


def audit(path):
    s, st = get(path)
    head = s[:s.find('</head>')]
    t = re.search(r'<title>([\s\S]*?)</title>', head)
    lds, bad = [], 0
    for m in re.finditer(r'<script type="application/ld\+json">([\s\S]*?)</script>', s):
        try:
            d = json.loads(m.group(1))
            for x in (d if isinstance(d, list) else d.get('@graph', [d]) if isinstance(d, dict) else []):
                lds.append(x.get('@type') if isinstance(x, dict) else '?')
        except Exception:
            bad += 1
    body = s[s.find('<body'):]
    h1 = [re.sub(r'<[^>]+>', '', x).strip()[:60] for x in re.findall(r'<h1[^>]*>([\s\S]*?)</h1>', body)]
    h2 = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', x)).strip()[:40] for x in re.findall(r'<h2[^>]*>([\s\S]*?)</h2>', body)]
    imgs = re.findall(r'<img\b[^>]*>', body)
    noalt = [i for i in imgs if re.search(r'\balt=""', i) or not re.search(r'\balt=', i)]
    first_img = imgs[0] if imgs else ''
    return {
        'status': st, 'title': re.sub(r'\s+', ' ', html.unescape(t.group(1))).strip() if t else None,
        'description': meta(head, 'name', 'description'), 'og:description': meta(head, 'property', 'og:description'),
        'twitter:description': meta(head, 'name', 'twitter:description'), 'og:image': meta(head, 'property', 'og:image'),
        'canonical': (re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', head) or [None, None])[1],
        'hreflang': len(re.findall(r'hreflang=', head)), 'preconnect cdn.shopify': 'preconnect' in head and 'cdn.shopify.com' in head,
        'json-ld types': lds, 'json-ld parse errors': bad, 'h1': h1, 'h2 (first 8)': h2[:8], 'imgs': len(imgs), 'imgs without alt': len(noalt),
        'first img': re.sub(r'\s+', ' ', first_img)[:220],
    }


if __name__ == '__main__':
    out = {}
    for k, p in PAGES.items():
        time.sleep(6)
        try:
            out[k] = audit(p)
        except Exception as e:
            out[k] = {'error': str(e)[:120]}
    print(json.dumps(out, ensure_ascii=False, indent=1))
