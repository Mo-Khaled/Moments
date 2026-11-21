"""Write the prompt list for the note pictures that are still missing (no Higgsfield calls, no credits).
Output: D:/MOMENTS_Content/06_Website/notes/NOTE_PICTURES_TODO.csv  (batch 1 = top 25 by perfume count, batch 2 = the rest)
Style text and settings are copied from the 37 existing pictures (notes/images/NOTE_PROMPTS.md):
GPT Image 2.6 Sunburst, 1:1, 2048x2048, Unlimited mode (Higgsfield web app). Only the subject changes.
usage: python scripts/notes-missing-prompts.py
"""
import csv

STYLE = ('A single [SUBJECT] as a still-life botanical illustration. Centered on a plain flat off-white background (#FCFCFA) '
         'with generous empty margin, subject filling about 60 percent of the frame. Hand-painted gouache and watercolor look: '
         'soft visible brush texture, fine pigment grain, gentle paper feel, muted natural colors. A very soft shadow under the '
         'subject tinted berry plum (#542747) at low opacity. No text, no labels, no frame, no border, no other objects. '
         'Square 1:1 composition.')

# slug, display name, perfume count (active products, tags merged by meaning), subject, other tag names that use the same picture
NOTES = [
    ('labdanum', 'Labdanum', 49, 'sprig of cistus (rockrose) with a small lump of dark sticky labdanum resin', ['cistus']),
    ('woody-notes', 'Woody Notes', 51, 'small stack of three short pieces of pale and dark wood with a curl of shaving', ['precious-woods', 'white-wood']),
    ('coconut', 'Coconut', 39, 'coconut, one whole and one halved showing white flesh', []),
    ('benzoin', 'Benzoin', 36, 'few amber-brown pieces of benzoin resin with a small branch', []),
    ('violet', 'Violet', 34, 'small bunch of purple violet flowers with heart-shaped leaves', []),
    ('ambroxan', 'Ambroxan', 34, 'few smooth pale amber-gold crystals catching soft light', ['ambrofix']),
    ('ylang-ylang', 'Ylang-Ylang', 38, 'ylang-ylang flower cluster with long drooping yellow petals', ['cananga']),
    ('praline', 'Praline', 32, 'few caramelised praline almonds with a small heap of crushed praline', []),
    ('peach', 'Peach', 31, 'peach with a leaf, one slice cut', []),
    ('guaiac-wood', 'Guaiac Wood', 37, 'piece of dark green-brown guaiac wood with a few chips', ['guaiacwood']),
    ('plum', 'Plum', 28, 'two dark purple plums with a leaf, one halved', []),
    ('honey', 'Honey', 27, 'small piece of honeycomb with a slow golden honey drip', []),
    ('tuberose', 'Tuberose', 26, 'tuberose stem with waxy white flowers and buds', []),
    ('mint', 'Mint', 25, 'sprig of fresh green mint leaves', []),
    ('peony', 'Peony', 25, 'single full pink peony with a bud and leaf', []),
    ('sage', 'Sage', 25, 'sprig of soft grey-green sage leaves', []),
    ('cashmeran', 'Cashmeran', 31, 'soft folded piece of warm beige cashmere wool with a small piece of pale wood', ['cashmere']),
    ('amberwood', 'Amberwood', 22, 'piece of honey-coloured wood with a few small pieces of golden amber resin', []),
    ('blackcurrant', 'Blackcurrant', 49, 'cluster of glossy blackcurrants with a leaf', ['black-currant', 'cassis']),
    ('neroli', 'Neroli', 21, 'sprig of white neroli (bitter orange) blossoms with glossy leaves', []),
    ('tobacco', 'Tobacco', 21, 'few dried golden-brown tobacco leaves, loosely rolled', []),
    ('almond', 'Almond', 20, 'few almonds, one in its velvety green-beige shell, one cracked open', []),
    ('aquatic-notes', 'Aquatic Notes', 30, 'small curling wave of clear blue-green water with a few droplets', ['marine']),
    ('white-flowers', 'White Flowers', 28, 'small posy of mixed white flowers', ['white-florals']),
    ('sugar', 'Sugar', 19, 'small heap of sparkling white sugar crystals with two sugar cubes', []),
    ('red-berries', 'Red Berries', 18, 'small mix of red berries: redcurrants, a strawberry and a raspberry', []),
    ('strawberry', 'Strawberry', 18, 'two ripe strawberries with a leaf, one halved', []),
    ('coffee', 'Coffee', 16, 'small heap of roasted coffee beans', []),
    ('lychee', 'Lychee', 26, 'cluster of lychees, one peeled showing white flesh', ['litchi']),
    ('clove', 'Clove', 15, 'small heap of dried cloves', []),
    ('clary-sage', 'Clary Sage', 14, 'clary sage stem with pale lilac-pink flower bracts', []),
    ('magnolia', 'Magnolia', 14, 'single open cream-white magnolia flower on a short branch', []),
    ('spicy-notes', 'Spicy Notes', 22, 'small mix of whole spices: a cinnamon stick, star anise, cloves and peppercorns', ['spice']),
    ('lime', 'Lime', 13, 'lime, one whole and one halved, with a leaf', []),
    ('basil', 'Basil', 12, 'sprig of green basil leaves', []),
    ('smoke', 'Smoke', 12, 'soft curl of pale grey smoke rising from a small ember', []),
    ('herbal', 'Herbal', 11, 'small bunch of mixed fresh herbs tied with a thread', []),
    ('apricot', 'Apricot', 11, 'apricot with a leaf, one halved showing the stone', []),
    ('orchid', 'Orchid', 11, 'single orchid stem with pale purple-white flowers', []),
    ('cherry', 'Cherry', 10, 'pair of dark red cherries on a stem with a leaf', []),
    ('osmanthus', 'Osmanthus', 10, 'sprig of tiny apricot-orange osmanthus flowers with leaves', []),
    ('akigalawood', 'Akigalawood', 10, 'piece of dark patchouli-like wood with a few dried patchouli leaves', []),
    ('elemi', 'Elemi', 10, 'few pale yellow-white pieces of elemi resin with a small green leaf', []),
    ('fig', 'Fig', 10, 'fig, one whole and one halved showing pink flesh, with a leaf', []),
    ('milk', 'Milk', 10, 'small glass jug of white milk with a gentle splash', []),
    ('cocoa', 'Cocoa', 13, 'cocoa pod halved showing beans, with a few cocoa beans', ['cacao']),
    ('freesia', 'Freesia', 9, 'freesia stem with pale yellow and white trumpet flowers', []),
    ('mango', 'Mango', 9, 'mango with a leaf, one slice cut', []),
    ('dates', 'Dates', 9, 'small cluster of glossy brown dates', []),
    ('birch', 'Birch', 9, 'piece of white birch bark with a small twig', []),
    ('green-notes', 'Green Notes', 9, 'few fresh green leaves and a cut grass blade', []),
    ('aldehydes', 'Aldehydes', 9, 'few sparkling clear bubbles and a soft white shimmer, like fizzing champagne', []),
    ('artemisia', 'Artemisia', 9, 'sprig of silvery artemisia (wormwood) leaves', []),
    ('nagarmotha', 'Nagarmotha', 14, 'few small dark cypriol (nagarmotha) roots', ['cypriol']),
    ('rosemary', 'Rosemary', 8, 'sprig of rosemary with small blue flowers', []),
    ('gardenia', 'Gardenia', 8, 'single creamy white gardenia with glossy leaves', []),
    ('myrrh', 'Myrrh', 8, 'few reddish-brown tears of myrrh resin', []),
    ('heliotrope', 'Heliotrope', 8, 'cluster of small purple heliotrope flowers', []),
    ('floral-notes', 'Floral Notes', 14, 'small mixed bouquet of soft pastel flowers', ['florals']),
    ('violet-leaf', 'Violet Leaf', 8, 'few dark green heart-shaped violet leaves', []),
    ('cypress', 'Cypress', 8, 'sprig of cypress with a small cone', []),
    ('suede', 'Suede', 8, 'soft folded piece of light taupe suede', []),
    ('davana', 'Davana', 7, 'sprig of silvery-green davana leaves with small yellow flower heads', []),
    ('lily', 'Lily', 7, 'single white lily with long petals and orange stamens', []),
    ('black-tea', 'Black Tea', 6, 'small heap of dark rolled black tea leaves with a few fresh tea leaves', []),
    ('fruity-notes', 'Fruity Notes', 6, 'small mix of fruit: a slice of pear, a few berries and a peach slice', []),
    ('juniper', 'Juniper', 6, 'juniper sprig with dusty blue berries', []),
    ('cognac', 'Cognac', 6, 'small tulip glass of amber cognac', []),
    ('rhubarb', 'Rhubarb', 6, 'few pink-red rhubarb stalks with a leaf', []),
    ('pistachio', 'Pistachio', 6, 'small heap of pistachios, some in open shells', []),
    ('sea-salt', 'Sea Salt', 6, 'small heap of white sea salt flakes', []),
    ('coumarin', 'Coumarin', 6, 'few tonka-like dark seeds with a small sprig of sweet hay', []),
    ('thyme', 'Thyme', 6, 'sprig of thyme with tiny leaves', []),
    ('marshmallow', 'Marshmallow', 5, 'few soft pale pink and white marshmallows', []),
    ('oriental-notes', 'Oriental Notes', 5, 'small brass dish with a few resin pieces and a cinnamon stick', []),
    ('tagete', 'Tagete', 5, 'sprig of orange marigold (tagetes) flowers', []),
    ('cherry-blossom', 'Cherry Blossom', 2, 'short branch of pale pink cherry blossoms', []),
    ('citrus', 'Citrus', 2, 'small mix of citrus: a lemon half, an orange slice and a lime', []),
    ('toffee', 'Toffee', 2, 'few glossy golden toffee pieces', []),
]


def main():
    rows = sorted(NOTES, key=lambda n: -n[2])
    out = 'D:/MOMENTS_Content/06_Website/notes/NOTE_PICTURES_TODO.csv'
    with open(out, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f)
        w.writerow(['batch', 'rank', 'note', 'slug', 'perfumes', 'also used for tags', 'target file', 'size', 'prompt'])
        for i, (slug, name, count, subject, alias) in enumerate(rows, 1):
            w.writerow([1 if i <= 25 else 2, i, name, slug, count, ' '.join(alias), f'note-{slug}.png', '2048x2048 PNG',
                        STYLE.replace('[SUBJECT]', subject)])
    print('wrote', out, len(rows), 'notes')


if __name__ == '__main__':
    main()
