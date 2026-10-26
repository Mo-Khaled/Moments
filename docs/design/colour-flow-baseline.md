# Colour flow baseline

Page /. Hard boundary = OKLab delta x100 above 8 between the last row of a section and the first row of the next. Limits: 1 hard per 1000px, 3 distinct surfaces.

## 1440px LTR: FAIL
11 sections, 5385px tall, 4 hard boundaries (0.74 per 1000px), 6 surface colours: #a27242 #241224 #3c1e3c #ead2c6 #96365a #cca854

| from | to | y | dE | above | below |
|---|---|---|---|---|---|
| template--23149939589311__moments_hero | template--23149939589311__moments_brands | 892 | 2.7 | #2c1825 | #251224 |
| template--23149939589311__moments_brands | template--23149939589311__moments_shop | 981 | 7.2 | #251224 | #3b1e3a |
| template--23149939589311__moments_shop | template--23149939589311__product_list_CYd9gQ | 2473 | 59.1 **hard** | #3b1e3a | #e9cfc8 |
| template--23149939589311__product_list_CYd9gQ | template--23149939589311__moments_gift | 3178 | 40.7 **hard** | #e9cfc8 | #99365a |
| template--23149939589311__moments_gift | template--23149939589311__moments_story | 3923 | 32.6 **hard** | #8f3154 | #cda553 |
| template--23149939589311__moments_story | template--23149939589311__section_xCc7xR | 4639 | 47.9 **hard** | #cda553 | #3b1e3a |
| template--23149939589311__section_xCc7xR | sections--23149939163327__footer | 4915 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer | sections--23149939163327__17650693132fb9bb25 | 5178 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__17650693132fb9bb25 | sections--23149939163327__footer_PEjxWb | 5288 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer_PEjxWb | sections--23149939163327__utilities | 5329 | 0 | #3b1e3a | #3b1e3a |

## 1440px RTL: FAIL
11 sections, 5520px tall, 4 hard boundaries (0.72 per 1000px), 6 surface colours: #a87248 #241224 #3c1e3c #ead2c6 #9c365a #cca854

| from | to | y | dE | above | below |
|---|---|---|---|---|---|
| template--23149939589311__moments_hero | template--23149939589311__moments_brands | 892 | 2.6 | #2c1825 | #251224 |
| template--23149939589311__moments_brands | template--23149939589311__moments_shop | 981 | 7.2 | #251224 | #3b1e3a |
| template--23149939589311__moments_shop | template--23149939589311__product_list_CYd9gQ | 2506 | 59.1 **hard** | #3b1e3a | #e9cfc8 |
| template--23149939589311__product_list_CYd9gQ | template--23149939589311__moments_gift | 3219 | 40.5 **hard** | #e9cfc8 | #99365b |
| template--23149939589311__moments_gift | template--23149939589311__moments_story | 3964 | 32.4 **hard** | #8f3155 | #cda553 |
| template--23149939589311__moments_story | template--23149939589311__section_xCc7xR | 4752 | 47.9 **hard** | #cda553 | #3b1e3a |
| template--23149939589311__section_xCc7xR | sections--23149939163327__footer | 5037 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer | sections--23149939163327__17650693132fb9bb25 | 5305 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__17650693132fb9bb25 | sections--23149939163327__footer_PEjxWb | 5419 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer_PEjxWb | sections--23149939163327__utilities | 5460 | 0 | #3b1e3a | #3b1e3a |

## 375px LTR: FAIL
11 sections, 4515px tall, 4 hard boundaries (0.89 per 1000px), 6 surface colours: #a27242 #241224 #3c1e3c #ead2c6 #9c365a #cca854

| from | to | y | dE | above | below |
|---|---|---|---|---|---|
| template--23149939589311__moments_hero | template--23149939589311__moments_brands | 692 | 3.9 | #2f1b25 | #251224 |
| template--23149939589311__moments_brands | template--23149939589311__moments_shop | 760 | 7.2 | #251224 | #3b1e3a |
| template--23149939589311__moments_shop | template--23149939589311__product_list_CYd9gQ | 1616 | 59.1 **hard** | #3b1e3a | #e9cfc8 |
| template--23149939589311__product_list_CYd9gQ | template--23149939589311__moments_gift | 2225 | 39.9 **hard** | #e9cfc8 | #9c375c |
| template--23149939589311__moments_gift | template--23149939589311__moments_story | 2909 | 33.1 **hard** | #8c3053 | #cda553 |
| template--23149939589311__moments_story | template--23149939589311__section_xCc7xR | 3754 | 47.9 **hard** | #cda553 | #3b1e3a |
| template--23149939589311__section_xCc7xR | sections--23149939163327__footer | 4053 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer | sections--23149939163327__17650693132fb9bb25 | 4274 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__17650693132fb9bb25 | sections--23149939163327__footer_PEjxWb | 4380 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer_PEjxWb | sections--23149939163327__utilities | 4420 | 0 | #3b1e3a | #3b1e3a |

## 375px RTL: FAIL
11 sections, 4733px tall, 4 hard boundaries (0.85 per 1000px), 6 surface colours: #a27248 #241224 #3c1e3c #ead2c6 #9c365a #cca854

| from | to | y | dE | above | below |
|---|---|---|---|---|---|
| template--23149939589311__moments_hero | template--23149939589311__moments_brands | 692 | 4.1 | #301c26 | #251224 |
| template--23149939589311__moments_brands | template--23149939589311__moments_shop | 760 | 7.2 | #251224 | #3b1e3a |
| template--23149939589311__moments_shop | template--23149939589311__product_list_CYd9gQ | 1635 | 59.1 **hard** | #3b1e3a | #e9cfc8 |
| template--23149939589311__product_list_CYd9gQ | template--23149939589311__moments_gift | 2256 | 40.1 **hard** | #e9cfc8 | #9c375c |
| template--23149939589311__moments_gift | template--23149939589311__moments_story | 2982 | 33 **hard** | #8c3053 | #cda553 |
| template--23149939589311__moments_story | template--23149939589311__section_xCc7xR | 3927 | 47.9 **hard** | #cda553 | #3b1e3a |
| template--23149939589311__section_xCc7xR | sections--23149939163327__footer | 4244 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer | sections--23149939163327__17650693132fb9bb25 | 4485 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__17650693132fb9bb25 | sections--23149939163327__footer_PEjxWb | 4595 | 0 | #3b1e3a | #3b1e3a |
| sections--23149939163327__footer_PEjxWb | sections--23149939163327__utilities | 4635 | 0 | #3b1e3a | #3b1e3a |
