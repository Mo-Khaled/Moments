"""Arabic for the store's short product fields (notes, season, gender, concentration, inspired-by names).
Corrects the machine translations in the store export: Apple was "أبل" (the brand), Orange "برتقالي" (the colour),
Sage "حكيم" (a wise man), Iris "قزحية" (the eye), Green Notes "ملاحظات خضراء" (remarks).
Rule as for product titles: perfume names are written as they sound, never translated word for word.
Used by fragrance-db.py (note names) and by the batch 4 translations import.
"""
import re

FIX = {
    # notes
    'Accord': 'أكورد', 'Apple': 'تفاح', 'Ambergris': 'عنبر رمادي', 'Amberwood': 'خشب العنبر', 'Ambrofix': 'أمبروفيكس',
    'Ambroxan': 'أمبروكسان', 'Aromatic Notes': 'نفحات عطرية', 'Blossom': 'زهور', 'Caraway': 'كراوية', 'Cookie': 'كوكيز',
    'Cyclamen': 'بخور مريم', 'Dry Amber': 'عنبر جاف', 'Floral Notes': 'نفحات زهرية', 'Fruity Notes': 'نفحات فاكهية',
    'Geranium': 'إبرة الراعي', 'Green Notes': 'نفحات خضراء', 'Green Accords': 'نفحات خضراء', 'Grey Amber': 'عنبر رمادي',
    'Iris': 'سوسن', 'Kumquat': 'كمكوات', 'Leather Accord': 'نفحة جلدية', 'Lily': 'زنبق', 'Lime': 'ليمون أخضر',
    'Mandarin': 'يوسفي', 'Marine': 'نفحات بحرية', 'Marine Accord': 'نفحة بحرية', 'Mate': 'متة', 'Nepeta Notes': 'نفحات النبيطة',
    'Orange': 'برتقال', 'Powdery Notes': 'نفحات بودرية', 'Rose': 'ورد', 'Sage': 'مريمية', 'Sweet Notes': 'نفحات حلوة',
    'Violet': 'بنفسج', 'Woods': 'أخشاب', 'Woody Notes': 'نفحات خشبية', 'Woody Accords': 'نفحات خشبية', 'Spicy Notes': 'نفحات حارة',
    'Oakwood': 'خشب البلوط', 'Warm Woods': 'أخشاب دافئة', 'Ancient Woods': 'أخشاب عتيقة', 'Citrus Notes': 'نفحات حمضية',
    'Creamy Notes': 'نفحات كريمية', 'Aquatic Notes': 'نفحات مائية', 'Sea Notes': 'نفحات بحرية', 'Marine Notes': 'نفحات بحرية',
    'Oriental Notes': 'نفحات شرقية', 'Earthy Notes': 'نفحات ترابية', 'Mineral Notes': 'نفحات معدنية', 'Ozonic Notes': 'نفحات أوزونية',
    'Salty Notes': 'نفحات مالحة', 'Tropical Notes': 'نفحات استوائية', 'Ylang-Ylang': 'إيلنغ إيلنغ', 'Ylang-ylang': 'إيلنغ إيلنغ',
    'Florals': 'زهور', 'Tagete': 'القطيفة', 'Cananga': 'كانانجا', 'Tonka Bean': 'حبوب التونكا', 'Pink Pepper': 'فلفل وردي',
    'Cashmeran': 'كاشميران', 'Coumarin': 'كومارين', 'Aldehydes': 'ألدهيدات', 'Labdanum': 'لبدانوم', 'Elemi': 'إليمي',
    'Osmanthus': 'أوسمانثوس', 'Cacao': 'كاكاو', 'Dates': 'تمر', 'Cistus': 'قسطوس', 'Black Currant': 'كشمش أسود',
    'Blackcurrant': 'كشمش أسود', 'Wood': 'خشب', 'Woody': 'خشبي', 'Sweet': 'حلو', 'Fresh': 'منعش', 'Spicy': 'حار',
    'Gourmand': 'جورماند', 'GOURMAND': 'جورماند', 'Mandarin Orange': 'يوسفي', 'Bitter Orange': 'برتقال مر',
    'Leather': 'جلد', 'Oud': 'عود', 'Agarwood': 'عود', 'Oud Wood': 'خشب العود', 'Cedar': 'أرز', 'Musk': 'مسك',
    # season, time, occasion, gender, concentration
    'Daily': 'يومي', 'Evening': 'مسائي', 'Morning': 'صباحي', 'Outing': 'خروجات', 'Summer': 'صيفي', 'Winter': 'شتوي',
    'All Season': 'لكل المواسم', 'Day & Night': 'ليل ونهار', 'Formal': 'رسمي', 'Pour Femme': 'للنساء', 'Pour Homme': 'للرجال',
    'Unisex': 'للجنسين', 'For Men': 'للرجال', 'For Women': 'للنساء', 'Eau De Parfum': 'أو دو بارفان', 'EAU DE PARFUM': 'أو دو بارفان',
    'Extrait De Parfum': 'إكستريه دو بارفان', 'Extrait de Parfum': 'إكستريه دو بارفان', 'Perfume Mist': 'رذاذ عطري',
    'Perfumed Spray': 'رذاذ عطري', 'Body Mist': 'رذاذ جسم', 'Body Spray': 'رذاذ جسم', 'AUTHENTIC PERFUME BY KHADLAJ': 'عطر أصلي من خدلج',
    # inspired-by names, as they sound
    'QUEEN OF SILK CREED': 'كوين أوف سيلك كريد', 'BLUE TALISMAN EX NIHILO': 'بلو تاليسمان إكس نيهيلو',
    'GRIS CHARNEL BDK': 'جري شارنيل BDK', 'Gris Charnel BDK Parfums': 'جري شارنيل BDK بارفان', 'The Most Wanted Azzaro': 'ذا موست وانتد أزارو',
    "The Omniscient Mr Thompson Penhaligon's": 'ذا أومنيشنت مستر تومسون بنهاليجونز', 'Legend Blue Montblanc': 'ليجند بلو مون بلان',
    'ONE MILLION LUCK': 'وان مليون لاك', 'I Want Choo Jimmy Choo': 'آي وانت تشو جيمي تشو',
    'Forever In Love LoveShackFancy': 'فوريفر إن لاف لوف شاك فانسي', 'INVICTUS VICTORY ELIXIR': 'إنفيكتوس فيكتوري إليكسير',
    'God of Fire Stéphane': 'جاد أوف فاير ستيفان', 'Goddess Burberry': 'جوديس بربري', 'Alexandria II Xerjoff': 'ألكسندريا II زيرجوف',
    'HACIVAT NISHANE': 'هاتشيفات نيشاني', 'Papilefiko Nishane': 'بابيليفيكو نيشاني', 'Wavechild Room 1015': 'ويف تشايلد روم 1015',
    'Absolu Aventus Creed للرجال': 'أبسولو أفينتوس كريد للرجال', 'By the Fireplace Maison Martin Margiela': 'باي ذا فاير بليس ميزون مارجيلا',
    "Love Don't Be Shy By Kilian": 'لاف دونت بي شاي باي كيليان', 'Good Girl Carolina Herrera': 'جود جيرل كارولينا هيريرا',
    'Very Good Girl Carolina Herrera': 'فيري جود جيرل كارولينا هيريرا', '1 Million Parfum Rabanne': 'وان مليون بارفان رابان',
    'Drunk Saffron BORNTOSTANDOUT': 'درانك سافرون بورن تو ستاند آوت', 'Eden Sparkling Lychee': 'إيدن سباركلينج ليتشي',
    'IMPERIAL VALLEY BY GISSAH': 'إمبريال فالي من جسة', 'Imperial Valley Gissah': 'إمبريال فالي جسة',
    'Nº4 Neon Thomas Kosmala': 'نمبر 4 نيون توماس كوزمالا', 'Y Eau de Parfum Yves Saint Laurent': 'واي أو دو بارفان إيف سان لوران',
    'Y Eau de Toilette Yves Saint Laurent': 'واي أو دو تواليت إيف سان لوران', 'Y Elixir Yves Saint Laurent': 'واي إليكسير إيف سان لوران',
    'Louis Vuitton Afternoon Swim': 'لويس فويتون أفترنون سويم', 'Encre Noire Lalique': 'إنكر نوار لاليك',
    'VANILLA CANDY ROCK SUGAR': 'فانيلا كاندي روك شوجر', 'Pistachio Kunafa Anfar 1950': 'بيستاشيو كنافة أنفار 1950',
    "Peach's Revenge Sarah Baker Perfumes": 'بيتشز ريفينج سارة بيكر', 'Meydan The Spirit of Dubai': 'ميدان ذا سبيريت أوف دبي',
    'Khamrah Lattafa Perfumes': 'خمرة لطافة', 'KHAMRAH LATTAFA PERFUMES': 'خمرة لطافة',
    "Halfeti Penhaligon's": 'هالفيتي بنهاليجونز', "Halfeti Leather Penhaligon's": 'هالفيتي ليذر بنهاليجونز',
    'Oud for Greatness Initio': 'عود فور جريتنس إنيشيو', 'Oud for Greatness Initio Parfums Prives': 'عود فور جريتنس إنيشيو بارفان بريفيه',
    'Devotion Dolce&Gabbana': 'ديفوشن دولتشي آند جابانا', 'Very Valentino Pour Homme Valentino': 'فيري فالنتينو بور هوم فالنتينو',
    'Versace Pour Homme': 'فيرساتشي بور هوم', 'Versace Pour Homme Dylan Blue': 'فيرساتشي بور هوم ديلان بلو',
    'VERSACE POUR HOMME DYLAN BLUE': 'فيرساتشي بور هوم ديلان بلو', 'Baccarat Rouge 540': 'باكارات روج 540', 'BACCARAT ROUGE 540': 'باكارات روج 540',
    'Gucci Guilty Absolute Pour Femme': 'جوتشي جيلتي أبسولوت بور فام', 'GUCCI GUILTY ABSOLUTE POUR FEMME': 'جوتشي جيلتي أبسولوت بور فام',
    'Legem Azaran Bvlgari': 'ليجيم أزاران بولغاري', "L'Homme Ultime Yves Saint Laurent": 'لوم ألتيم إيف سان لوران',
    'Stronger With You For Man - Armani': 'سترونجر ويذ يو فور مان - أرماني', 'STRONGER WITH YOU FOR MAN - ARMANI': 'سترونجر ويذ يو فور مان - أرماني',
    'Burberry Her Elixir de Parfum Burberry': 'بربري هير إليكسير دو بارفان', 'Pepe Jeans for Her Pepe Jeans London': 'بيبي جينز فور هير',
}

SIZE = re.compile(r'^\s*(\d+(?:\.\d+)?)\s*(ml|g)\s*$', re.I)

def arabic(value):
    """the corrected Arabic for one field value, or None when the store's translation can stay"""
    v = value.strip()
    if v in FIX:
        return FIX[v]
    m = SIZE.match(v)
    if m:  # Western digits, as on the rest of the site
        return f"{m.group(1)} {'مل' if m.group(2).lower() == 'ml' else 'جم'}"
    return None
