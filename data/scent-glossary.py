"""Plain-language glossary for the scent filters and the product page "Understanding this scent" box.
Written for someone who knows nothing about perfume (owner request 2026-10-31), in the pattern the big perfume sites use
(note pyramid, scent family, when to wear) but in our own words. merge_into_locales() writes it to locales/*.json under
"scent"; keys are the tag value handleized ("note:Lily Of The Valley" -> "lily-of-the-valley").
Run: python data/scent-glossary.py
"""
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# family: (Arabic name, English explanation, Arabic explanation)
FAMILIES = {
    "Woody": ("خشبي", "Dry, warm and calm, like polished wood or a cedar chest. Smooth and grown-up.", "دافئ وهادئ وجاف، مثل الخشب المصقول أو صندوق من خشب الأرز. ناعم وراقٍ."),
    "Floral": ("زهري", "Smells like fresh flowers: soft, romantic and easy to like.", "رائحة الزهور الطازجة: ناعمة ورومانسية ومحبوبة بسهولة."),
    "Gourmand": ("حلو (جورماند)", "Sweet and edible: vanilla, caramel, sugar. Cosy, like a dessert.", "حلو وشهي مثل الحلويات: فانيليا وكراميل وسكر. دافئ ومريح."),
    "Amber & Oriental": ("عنبري وشرقي", "Warm, rich and slightly sweet, with resins and spices. Lasts long and feels luxurious.", "دافئ وغني وحلو قليلًا، بالراتنجات والتوابل. يدوم طويلًا ويشعرك بالفخامة."),
    "Musky": ("مسكي", "Clean, soft and skin-like, like fresh laundry. Close to the skin and comforting.", "نظيف وناعم وقريب من رائحة البشرة، مثل الغسيل النظيف. هادئ ومريح."),
    "Citrus": ("حمضي", "Bright and juicy: lemon, orange, bergamot. Fresh and energising, best in the heat.", "منعش ومشرق: ليمون وبرتقال وبرغموت. يمنح نشاطًا، ومثالي في الحر."),
    "Spicy": ("حار", "Warm kitchen spices like cinnamon, cardamom and pepper. Lively and bold.", "توابل دافئة مثل القرفة والهيل والفلفل. حيوي وجريء."),
    "Fruity": ("فاكهي", "Sweet, juicy fruit like berries, apple or peach. Playful and cheerful.", "فاكهة حلوة وعصيرية مثل التوت والتفاح والخوخ. مرح ومبهج."),
    "Patchouli": ("باتشولي", "Earthy and deep, like damp soil and dark leaves. Adds depth and lasts long.", "ترابي وعميق، مثل التربة الرطبة والأوراق الداكنة. يضيف عمقًا ويدوم طويلًا."),
    "Oud": ("عود", "The precious Middle Eastern wood: smoky, rich and intense. A little goes a long way.", "الخشب الثمين في الشرق: مدخن وغني وقوي. القليل منه يكفي."),
    "Leather & Tobacco": ("جلد وتبغ", "Smooth leather and dried tobacco leaves. Warm, confident and evening-ready.", "جلد ناعم وأوراق تبغ مجففة. دافئ وواثق ومناسب للمساء."),
    "Fresh & Aquatic": ("منعش ومائي", "Cool and airy, like sea breeze or fresh water. Clean and light for hot days.", "بارد ومنعش، مثل نسيم البحر أو الماء العذب. نظيف وخفيف للأيام الحارة."),
}

# note: (Arabic name, English, Arabic)
NOTES = {
    "Musk": ("مسك", "Soft and clean, like warm skin. It makes a perfume last.", "ناعم ونظيف مثل دفء البشرة، ويساعد العطر على الثبات."),
    "White Musk": ("مسك أبيض", "The cleanest musk: fresh laundry and powder.", "أنظف أنواع المسك: رائحة الغسيل النظيف والبودرة."),
    "Warm Musk": ("مسك دافئ", "Musk with a cosy, slightly sweet warmth.", "مسك بدفء مريح وحلاوة خفيفة."),
    "Vanilla": ("فانيليا", "Sweet and creamy, like a vanilla dessert. Warm and comforting.", "حلوة وكريمية مثل حلوى الفانيليا. دافئة ومريحة."),
    "Amber": ("عنبر", "Warm, golden and slightly sweet. Gives a cosy glow.", "دافئ وذهبي وحلو قليلًا، يمنح إحساسًا بالدفء."),
    "Dry Amber": ("عنبر جاف", "Amber without the sugar: warm, woody and dry.", "عنبر بلا سكر: دافئ وخشبي وجاف."),
    "Ambergris": ("عنبر رمادي", "Salty, warm and skin-like. Makes a scent glow and last.", "مالح ودافئ وقريب من البشرة، يمنح العطر إشراقًا وثباتًا."),
    "Ambroxan": ("أمبروكسان", "Modern, clean and woody-amber. Feels fresh but lasts.", "عصري ونظيف بلمسة خشبية عنبرية. منعش لكنه يدوم."),
    "Amberwood": ("خشب العنبر", "Dry, warm wood with an amber glow. Strong and modern.", "خشب دافئ وجاف بلمسة عنبر. قوي وعصري."),
    "Patchouli": ("باتشولي", "Earthy and dark, like damp soil. Adds depth.", "ترابي وداكن مثل التربة الرطبة، يضيف عمقًا."),
    "Bergamot": ("برغموت", "A bright citrus between lemon and orange. Fresh opening.", "حمضيات مشرقة بين الليمون والبرتقال، افتتاحية منعشة."),
    "Jasmine": ("ياسمين", "A rich white flower: sweet, heady and elegant.", "زهرة بيضاء غنية: حلوة وفواحة وأنيقة."),
    "Sandalwood": ("خشب الصندل", "Creamy, smooth wood. Soft, warm and calming.", "خشب كريمي وناعم، دافئ ومهدئ."),
    "Rose": ("ورد", "The classic flower: romantic, fresh and a little sweet.", "الزهرة الكلاسيكية: رومانسية ومنعشة وحلوة قليلًا."),
    "Cedarwood": ("خشب الأرز", "Dry, clean wood, like pencil shavings. Calm and steady.", "خشب جاف ونظيف مثل برادة الأقلام. هادئ ومتزن."),
    "Oud": ("عود", "Precious, smoky and intense wood, loved across the Gulf.", "خشب ثمين ومدخن وقوي، محبوب في الخليج."),
    "Oud Wood": ("خشب العود", "A smoother, softer take on oud.", "عود بلمسة أنعم وأخف."),
    "Tonka Bean": ("حبوب التونكا", "Sweet like vanilla with a hint of almond and hay.", "حلوة مثل الفانيليا مع لمسة لوز وقش."),
    "Coumarin": ("كومارين", "The sweet, hay-like smell found in tonka beans.", "الرائحة الحلوة الشبيهة بالقش في حبوب التونكا."),
    "Saffron": ("زعفران", "Warm, slightly leathery spice. Luxurious and rich.", "تابل دافئ بلمسة جلدية، فاخر وغني."),
    "Lavender": ("خزامى", "Fresh, herbal and calming, like clean sheets.", "عشبي منعش ومهدئ، مثل الملاءات النظيفة."),
    "Vetiver": ("نجيل الهند", "Green, earthy grass roots. Dry and elegant.", "جذور عشب خضراء وترابية، جافة وأنيقة."),
    "Leather": ("جلد", "Smooth new leather. Bold and confident.", "جلد جديد وناعم، جريء وواثق."),
    "Suede": ("شمواه", "Soft, velvety leather. Gentle and warm.", "جلد مخملي ناعم، لطيف ودافئ."),
    "Cinnamon": ("قرفة", "Warm, sweet spice, like fresh baking.", "تابل دافئ وحلو مثل المخبوزات الطازجة."),
    "Orange Blossom": ("زهر البرتقال", "Sunny white flower with a honeyed sweetness.", "زهرة بيضاء مشمسة بحلاوة تشبه العسل."),
    "Orange Flower": ("زهرة البرتقال", "Sunny white flower with a honeyed sweetness.", "زهرة بيضاء مشمسة بحلاوة تشبه العسل."),
    "Neroli": ("نيرولي", "Fresh, green-citrus side of the orange flower.", "الجانب الأخضر المنعش من زهرة البرتقال."),
    "Pink Pepper": ("فلفل وردي", "A light, sparkling spice. Fresh, not hot.", "تابل خفيف ولامع، منعش وليس حارًا."),
    "Black Pepper": ("فلفل أسود", "Dry, sharp spice that adds a kick.", "تابل جاف وحاد يضيف حيوية."),
    "Incense": ("بخور", "Smoky resin, like a calm, peaceful room.", "راتنج مدخن، مثل غرفة هادئة يملؤها البخور."),
    "Cardamom": ("هيل", "Fresh, warm spice, like Arabic coffee.", "تابل منعش ودافئ مثل القهوة العربية."),
    "Apple": ("تفاح", "Crisp and juicy. Fresh and cheerful.", "مقرمش وعصيري، منعش ومبهج."),
    "Lemon": ("ليمون", "Sharp, sunny and clean. A fresh start.", "حاد ومشمس ونظيف، بداية منعشة."),
    "Lime": ("ليمون أخضر", "Zesty, green and tangy.", "حامض وأخضر ومنعش."),
    "Mandarin": ("يوسفي", "Sweet, juicy citrus. Bright and happy.", "حمضيات حلوة وعصيرية، مشرقة ومبهجة."),
    "Tangerine": ("يوسفي", "Sweet, juicy citrus. Bright and happy.", "حمضيات حلوة وعصيرية، مشرقة ومبهجة."),
    "Orange": ("برتقال", "Sweet, juicy orange peel. Sunny and fresh.", "قشر برتقال حلو وعصيري، مشمس ومنعش."),
    "Grapefruit": ("جريب فروت", "Bitter-fresh citrus. Sparkling and energising.", "حمضيات منعشة بمرارة خفيفة، فوارة ومنشطة."),
    "Geranium": ("إبرة الراعي", "Green, rosy leaf. Fresh and a little minty.", "ورق أخضر بلمسة ورد، منعش وبه نعناع خفيف."),
    "Caramel": ("كراميل", "Sweet, buttery and golden, like toffee.", "حلو وزبدي وذهبي مثل التوفي."),
    "Pineapple": ("أناناس", "Tropical, sweet and juicy.", "استوائي وحلو وعصيري."),
    "Lily Of The Valley": ("زنبق الوادي", "Delicate spring flower: fresh, green and clean.", "زهرة ربيعية رقيقة: منعشة وخضراء ونظيفة."),
    "Muguet": ("زنبق الوادي", "Delicate spring flower: fresh, green and clean.", "زهرة ربيعية رقيقة: منعشة وخضراء ونظيفة."),
    "Oakmoss": ("طحلب البلوط", "Damp forest moss. Earthy, green and classic.", "طحلب الغابة الرطب، ترابي وأخضر وكلاسيكي."),
    "Oak Moss": ("طحلب البلوط", "Damp forest moss. Earthy, green and classic.", "طحلب الغابة الرطب، ترابي وأخضر وكلاسيكي."),
    "Moss": ("طحلب", "Green, damp and earthy, like a forest floor.", "أخضر ورطب وترابي مثل أرض الغابة."),
    "Raspberry": ("توت العليق", "Sweet-tart red berry. Juicy and fun.", "توت أحمر حلو بحموضة خفيفة، عصيري ومرح."),
    "Red Berries": ("التوت الأحمر", "A mix of sweet red berries. Juicy and bright.", "مزيج من التوت الأحمر الحلو، عصيري ومشرق."),
    "Strawberry": ("فراولة", "Sweet, candy-like strawberry.", "فراولة حلوة تشبه الحلوى."),
    "Cherry": ("كرز", "Dark, sweet cherry. Juicy and a little almond-like.", "كرز داكن وحلو، عصيري بلمسة لوز."),
    "Blackcurrant": ("كشمش أسود", "Tart, dark berry with a green edge.", "توت داكن بحموضة ولمسة خضراء."),
    "Black Currant": ("كشمش أسود", "Tart, dark berry with a green edge.", "توت داكن بحموضة ولمسة خضراء."),
    "Cassis": ("كاسيس", "Tart, dark berry with a green edge.", "توت داكن بحموضة ولمسة خضراء."),
    "Iris": ("سوسن", "Powdery and elegant, like soft make-up powder.", "بودري وأنيق، مثل بودرة المكياج الناعمة."),
    "Orris": ("سوسن", "Powdery and elegant, like soft make-up powder.", "بودري وأنيق، مثل بودرة المكياج الناعمة."),
    "Nutmeg": ("جوز الطيب", "Warm, nutty spice.", "تابل دافئ بنكهة المكسرات."),
    "Labdanum": ("لبدانوم", "Sticky, warm resin. Deep and amber-like.", "راتنج دافئ ولزج، عميق ويشبه العنبر."),
    "Cistus": ("قسطوس", "Warm, resinous shrub. Deep and amber-like.", "شجيرة راتنجية دافئة، عميقة وتشبه العنبر."),
    "Ginger": ("زنجبيل", "Fresh, zesty spice with a warm bite.", "تابل منعش وحيوي بلمسة دافئة."),
    "Coconut": ("جوز الهند", "Creamy, sunny and tropical.", "كريمي ومشمس واستوائي."),
    "Woody Notes": ("نفحات خشبية", "A blend of woods: dry, warm and smooth.", "مزيج من الأخشاب: جاف ودافئ وناعم."),
    "Precious Woods": ("الأخشاب الثمينة", "A blend of fine woods: warm and rich.", "مزيج من الأخشاب الفاخرة: دافئ وغني."),
    "Benzoin": ("بنزوين", "Sweet, vanilla-like resin. Soft and warm.", "راتنج حلو يشبه الفانيليا، ناعم ودافئ."),
    "Violet": ("بنفسج", "Soft, powdery flower with a sweet touch.", "زهرة ناعمة بودرية بلمسة حلوة."),
    "Violet Leaf": ("ورقة البنفسج", "Green and fresh, like cut leaves.", "أخضر ومنعش مثل الأوراق المقطوفة."),
    "Praline": ("برالين", "Sweet caramelised nuts. Rich and gourmand.", "مكسرات مكرملة حلوة، غنية وشهية."),
    "Peach": ("خوخ", "Soft, velvety and juicy fruit.", "فاكهة ناعمة مخملية وعصيرية."),
    "Apricot": ("مشمش", "Soft, sunny fruit, a little like peach.", "فاكهة ناعمة مشمسة تشبه الخوخ."),
    "Plum": ("برقوق", "Dark, sweet and jammy fruit.", "فاكهة داكنة حلوة تشبه المربى."),
    "Honey": ("عسل", "Golden, sweet and warm.", "ذهبي وحلو ودافئ."),
    "Tuberose": ("مسك الروم", "Creamy, intense white flower. Bold and glamorous.", "زهرة بيضاء كريمية قوية، جريئة وساحرة."),
    "Pear": ("كمثرى", "Fresh, juicy and lightly sweet.", "منعشة وعصيرية وحلوة قليلًا."),
    "Guaiac Wood": ("خشب الغاياك", "Smoky, slightly sweet wood.", "خشب مدخن بحلاوة خفيفة."),
    "Guaiacwood": ("خشب الغاياك", "Smoky, slightly sweet wood.", "خشب مدخن بحلاوة خفيفة."),
    "Sage": ("مريمية", "Fresh, herbal and aromatic.", "عشبية ومنعشة وعطرية."),
    "Clary Sage": ("ميرمية كلاري", "Herbal and slightly sweet, with a soft musky side.", "عشبية وحلوة قليلًا بلمسة مسكية ناعمة."),
    "Peony": ("فاوانيا", "Light, fresh pink flower.", "زهرة وردية خفيفة ومنعشة."),
    "Cashmeran": ("كاشميران", "Soft, warm and fuzzy, like a cashmere sweater.", "ناعم ودافئ مثل كنزة الكشمير."),
    "Cashmere": ("الكشمير", "Soft, warm and fuzzy, like a cashmere sweater.", "ناعم ودافئ مثل كنزة الكشمير."),
    "Mint": ("نعناع", "Cool and refreshing.", "بارد ومنعش."),
    "Tobacco": ("تبغ", "Dried tobacco leaves: warm, sweet and smoky (not cigarette smoke).", "أوراق تبغ مجففة: دافئة وحلوة ومدخنة (ليست رائحة السجائر)."),
    "Ylang-ylang": ("إيلنغ إيلنغ", "Creamy, sunny tropical flower.", "زهرة استوائية كريمية ومشمسة."),
    "Ylang Ylang": ("إيلنغ إيلنغ", "Creamy, sunny tropical flower.", "زهرة استوائية كريمية ومشمسة."),
    "Cananga": ("كانانجا", "A cousin of ylang-ylang: creamy and floral.", "قريبة من الإيلنغ إيلنغ: كريمية وزهرية."),
    "White Flowers": ("زهور بيضاء", "A bouquet of white flowers: creamy and elegant.", "باقة زهور بيضاء: كريمية وأنيقة."),
    "White Florals": ("زهور بيضاء", "A bouquet of white flowers: creamy and elegant.", "باقة زهور بيضاء: كريمية وأنيقة."),
    "Florals": ("زهور", "A mixed bouquet of flowers.", "باقة زهور متنوعة."),
    "Floral Notes": ("نفحات زهرية", "A mixed bouquet of flowers.", "باقة زهور متنوعة."),
    "Aquatic Notes": ("نفحات مائية", "Cool and watery, like a sea breeze.", "باردة ومائية مثل نسيم البحر."),
    "Marine": ("نفحات بحرية", "Salty sea air. Fresh and open.", "هواء البحر المالح، منعش ومنفتح."),
    "Sea Salt": ("ملح بحري", "Salty, sunny skin after a swim.", "بشرة مالحة مشمسة بعد السباحة."),
    "Almond": ("لوز", "Sweet, nutty, like marzipan.", "حلو بنكهة المكسرات مثل المرزبان."),
    "Sugar": ("سكر", "Pure sweetness, like candy.", "حلاوة خالصة مثل الحلوى."),
    "Marshmallow": ("مارشميلو", "Soft, fluffy and sugary.", "ناعم وهش وسكري."),
    "Coffee": ("قهوة", "Roasted coffee beans. Rich and energising.", "حبوب قهوة محمصة، غنية ومنشطة."),
    "Litchi": ("ليتشي", "Juicy, rosy exotic fruit.", "فاكهة استوائية عصيرية بلمسة ورد."),
    "Lychee": ("ليتشي", "Juicy, rosy exotic fruit.", "فاكهة استوائية عصيرية بلمسة ورد."),
    "Clove": ("قرنفل", "Strong, warm spice. Bold and festive.", "تابل قوي ودافئ، جريء واحتفالي."),
    "Magnolia": ("ماغنوليا", "Creamy flower with a fresh, lemony touch.", "زهرة كريمية بلمسة ليمون منعشة."),
    "Spice": ("توابل", "A mix of warm spices.", "مزيج من التوابل الدافئة."),
    "Spicy Notes": ("نفحات حارة", "A mix of warm spices.", "مزيج من التوابل الدافئة."),
    "Smoke": ("دخان", "Smoky, like a wood fire.", "مدخن مثل نار الحطب."),
    "Basil": ("ريحان", "Fresh, green herb.", "عشبة خضراء منعشة."),
    "Orchid": ("أوركيد", "Exotic, soft and slightly sweet flower.", "زهرة غريبة ناعمة وحلوة قليلًا."),
    "Osmanthus": ("أوسمانثوس", "Flower that smells of apricot and leather.", "زهرة برائحة المشمش والجلد."),
    "Fig": ("تين", "Green, milky and fruity, like a fig tree.", "أخضر وحليبي وفاكهي مثل شجرة التين."),
    "Elemi": ("إليمي", "Fresh, lemony resin.", "راتنج منعش بلمسة ليمون."),
    "Nagarmotha": ("ناجارموثا", "Earthy, smoky root, close to oud.", "جذر ترابي مدخن قريب من العود."),
    "Cypriol": ("السعدية", "Earthy, smoky root, close to oud.", "جذر ترابي مدخن قريب من العود."),
    "Milk": ("حليب", "Soft, creamy and comforting.", "ناعم وكريمي ومريح."),
    "Mango": ("مانجو", "Juicy, tropical and sweet.", "عصيرية واستوائية وحلوة."),
    "Herbal": ("أعشاب", "Fresh green herbs.", "أعشاب خضراء منعشة."),
    "Green Notes": ("نفحات خضراء", "Freshly cut grass and leaves.", "عشب وأوراق مقطوفة حديثًا."),
    "Freesia": ("فريزيا", "Light, fresh and fruity flower.", "زهرة خفيفة ومنعشة بلمسة فاكهة."),
    "Dates": ("تمر", "Sweet, rich and syrupy.", "حلو وغني مثل الشراب."),
    "Birch": ("بتولا", "Smoky, leathery wood.", "خشب مدخن بلمسة جلدية."),
    "Aldehydes": ("ألدهيدات", "Sparkling, soapy and clean, like fresh linen.", "فوار ونظيف برائحة الصابون، مثل الكتان النظيف."),
    "Akigalawood": ("أكيجالاوود", "Woody and peppery, with a spicy edge.", "خشبي بلمسة فلفل حارة."),
    "Rosemary": ("إكليل الجبل", "Fresh, herbal and aromatic.", "عشبي منعش وعطري."),
    "Myrrh": ("مُرّ", "Ancient, smoky-sweet resin.", "راتنج قديم بحلاوة مدخنة."),
    "Heliotrope": ("هليوتروب", "Powdery, almond-like flower.", "زهرة بودرية تشبه اللوز."),
    "Gardenia": ("جاردينيا", "Creamy, lush white flower.", "زهرة بيضاء كريمية فواحة."),
    "Cypress": ("سرو", "Fresh, green, piney wood.", "خشب أخضر منعش يشبه الصنوبر."),
    "Cacao": ("كاكاو", "Dark, bitter-sweet chocolate.", "شوكولاتة داكنة بحلاوة ومرارة."),
    "Cocoa": ("كاكاو", "Dark, bitter-sweet chocolate.", "شوكولاتة داكنة بحلاوة ومرارة."),
    "Artemisia": ("أرطماسيا", "Bitter, green and herbal.", "عشبي أخضر بمرارة خفيفة."),
    "Lily": ("زنبق", "Fresh, elegant white flower.", "زهرة بيضاء منعشة وأنيقة."),
    "Thyme": ("الزعتر", "Warm, aromatic herb.", "عشبة عطرية دافئة."),
    "Rhubarb": ("راوند", "Tart, green and juicy.", "حامض وأخضر وعصيري."),
    "Pistachio": ("فستق", "Creamy, nutty and sweet.", "كريمي وحلو بنكهة المكسرات."),
    "Juniper": ("عرعر", "Fresh, piney berry.", "توت منعش يشبه الصنوبر."),
    "Black Tea": ("شاي أسود", "Smoky, dry tea leaves.", "أوراق شاي جافة بلمسة مدخنة."),
    "Tagete": ("القطيفة", "Green, fruity marigold flower.", "زهرة القطيفة الخضراء الفاكهية."),
    "Oriental Notes": ("نفحات شرقية", "Warm resins and spices.", "راتنجات وتوابل دافئة."),
    "Fruity Notes": ("نفحات فاكهية", "A mix of sweet fruits.", "مزيج من الفاكهة الحلوة."),
    "Davana": ("دافانا", "Fruity, boozy herb, a little like dried apricot.", "عشبة فاكهية تشبه المشمش المجفف."),
    "Cognac": ("كونياك", "Warm, fruity and boozy.", "دافئ وفاكهي بلمسة مشروب معتق."),
    "Citrus": ("حمضيات", "A mix of lemon, orange and other citrus fruits. Bright and fresh.", "مزيج من الليمون والبرتقال والحمضيات، مشرق ومنعش."),
    "Cherry Blossom": ("زهر الكرز", "Soft, delicate pink blossom. Light and romantic.", "زهرة وردية رقيقة، خفيفة ورومانسية."),
    "White Wood": ("خشب أبيض", "Light, clean and creamy wood.", "خشب خفيف ونظيف وكريمي."),
    "Toffee": ("توفي", "Buttery, golden caramel candy.", "حلوى كراميل ذهبية بطعم الزبدة."),
    "Ambrofix": ("أمبروفكس", "Clean, modern amber-wood that makes a scent last.", "عنبر خشبي نظيف وعصري يساعد العطر على الثبات."),
}

LABELS = {
    "en": {
        "filters_title": "Scent filters", "clear": "Clear scent filters",
        "group_family": "Scent family", "group_note": "Notes", "group_gender": "For", "group_season": "Season",
        "group_time": "Time of day", "group_type": "Strength", "group_size": "Bottle size", "show_all_notes": "Show all notes",
        "explain_title": "Understanding this scent",
        "explain_intro": "New to perfume? Here is what this one smells like, in plain words.",
        "pyramid_title": "How a perfume unfolds",
        "pyramid_top": "First minutes: the light notes you smell first. They fade within about 15 to 30 minutes.",
        "pyramid_heart": "The next hours: the heart, the true character of the perfume, for about 2 to 4 hours.",
        "pyramid_base": "What stays: the deep notes that remain on your skin for many hours.",
        "family_title": "Its scent family", "notes_title": "What you will smell", "wear_title": "When to wear it",
        "skin_note": "Every skin is different: the same perfume can smell slightly different on you.",
    },
    "ar": {
        "filters_title": "تصفية حسب الرائحة", "clear": "مسح فلاتر الرائحة",
        "group_family": "عائلة الرائحة", "group_note": "المكونات", "group_gender": "لمن", "group_season": "الموسم",
        "group_time": "الوقت", "group_type": "التركيز", "group_size": "حجم العبوة", "show_all_notes": "كل المكونات",
        "explain_title": "تعرّف على هذا العطر",
        "explain_intro": "جديد على العطور؟ هذه رائحة العطر بكلمات بسيطة.",
        "pyramid_title": "كيف يتطور العطر على بشرتك",
        "pyramid_top": "الدقائق الأولى: النفحات الخفيفة التي تشمّها أولًا، وتتلاشى خلال ١٥ إلى ٣٠ دقيقة تقريبًا.",
        "pyramid_heart": "الساعات التالية: قلب العطر وشخصيته الحقيقية، لمدة ساعتين إلى ٤ ساعات تقريبًا.",
        "pyramid_base": "ما يبقى: النفحات العميقة التي تبقى على بشرتك لساعات طويلة.",
        "family_title": "عائلة الرائحة", "notes_title": "ما ستشمّه", "wear_title": "متى تضعه",
        "skin_note": "كل بشرة مختلفة: قد تختلف رائحة العطر نفسه عليك قليلًا.",
    },
}

VALUES = {  # gender / season / time / type tag values
    "Men": "رجالي", "Women": "نسائي", "Unisex": "للجنسين",
    "Summer": "صيفي", "Winter": "شتوي", "All year": "طوال العام",
    "Day": "نهارًا", "Night": "مساءً", "Day & night": "نهارًا ومساءً",
    "Eau de Parfum": "أو دو بارفان", "Extrait de Parfum": "إكستريه دو بارفان", "Body Mist": "رذاذ جسم",
}
VALUE_EXPLAIN = {
    "Summer": ("Light enough for hot days.", "خفيف ومناسب للأيام الحارة."),
    "Winter": ("Warm and rich, made for cool weather.", "دافئ وغني، مناسب للطقس البارد."),
    "All year": ("Easy to wear in any season.", "مناسب لكل المواسم."),
    "Day": ("Fresh and easy for daytime, work or university.", "منعش ومناسب للنهار والعمل والجامعة."),
    "Night": ("Deeper and bolder: evenings and going out.", "أعمق وأجرأ: للمساء والسهرات."),
    "Day & night": ("Works from morning to evening.", "يناسب من الصباح حتى المساء."),
}


def handle(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def build(lang):
    i = 1 if lang == "en" else 2
    out = dict(LABELS[lang])
    out["family"] = {handle(k): {"name": k if lang == "en" else v[0], "about": v[i]} for k, v in FAMILIES.items()}
    out["note"] = {handle(k): {"name": k if lang == "en" else v[0], "about": v[i]} for k, v in NOTES.items()}
    out["value"] = {handle(k): (k if lang == "en" else v) for k, v in VALUES.items()}
    out["value_about"] = {handle(k): v[0 if lang == "en" else 1] for k, v in VALUE_EXPLAIN.items()}
    return out


def merge_into_locales():
    for lang, path in (("en", "locales/en.default.json"), ("ar", "locales/ar.json")):
        full = os.path.join(ROOT, path)
        text = open(full, encoding="utf-8").read()
        header = ""
        m = re.match(r"\s*/\*.*?\*/\s*", text, re.S)
        if m:
            header, text = m.group(0), text[m.end():]
        data = json.loads(text)
        data["scent"] = build(lang)
        with open(full, "w", encoding="utf-8", newline="\n") as f:
            f.write(header + json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print(path, "scent keys:", len(data["scent"]["note"]), "notes,", len(data["scent"]["family"]), "families")


if __name__ == "__main__":
    merge_into_locales()
