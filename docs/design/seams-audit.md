# Seams audit (before)

Every join between two consecutive sections: what paints each side, and anything sitting on the join (border, shadow, outline, thin pseudo-element, margin, overflow, isolation, z-index). Crops: docs/screenshots/colour-flow/before-joins/ (regenerate with scripts/audit-seams.mjs) (400px tall, centred on the join).

## / at 1440px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-100 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242)  | - |
| 2 | div#23149939589311__moments_hero.shopify-section.m-hero-section | 100-892 | section.m-hero bg=rgb(37, 18, 36) <br>div.m-slide__bg bg=rgba(0, 0, 0, 0) img=linear-gradient(155deg, rgb(133, 90, 0), rgb(98, 64, 0))<br>div.m-slide__scrim bg=rgba(0, 0, 0, 0) img=linear-gradient(to top, rgba(37, 18, 36, 0.82), rgba(37, 18, 36, 0.45) 38%, rgba(37, 18, 36, 0) 70%), linear-g | - |
| 3 | div#149939589311__moments_brands.shopify-section | 892-981 | section.m-brands bg=rgb(37, 18, 36)  | section.m-brands: border-bottom 1px rgb(205, 165, 83) |
| 4 | div#23149939589311__moments_shop.shopify-section | 981-2473 | section.m-moments bg=rgb(59, 30, 58)  | - |
| 5 | div#9589311__product_list_CYd9gQ.shopify-section.ui-test-product-list | 2473-3178 | div.section-background.color-scheme-4 bg=rgb(233, 207, 200)  | - |
| 6 | div#23149939589311__moments_gift.shopify-section | 3178-3923 | section.m-gift.m-tone--gift bg=rgba(0, 0, 0, 0) img=linear-gradient(155deg, rgb(145, 67, 115), rgb(108, 46, 84)) | - |
| 7 | div#3149939589311__moments_story.shopify-section | 3923-4639 | section.m-story bg=rgb(98, 64, 0)  | - |
| 8 | div#149939589311__section_xCc7xR.shopify-section.section-wrapper | 4639-4915 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 9 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 4915-5178 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 10 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 5178-5288 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 11 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 5288-5329 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 12 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 5329-5385 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## / at 375px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-92 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 2 | div#23149939589311__moments_hero.shopify-section.m-hero-section | 92-692 | section.m-hero bg=rgb(37, 18, 36) <br>div.m-slide__bg bg=rgba(0, 0, 0, 0) img=linear-gradient(155deg, rgb(133, 90, 0), rgb(98, 64, 0))<br>div.m-slide__scrim bg=rgba(0, 0, 0, 0) img=linear-gradient(to top, rgba(37, 18, 36, 0.82), rgba(37, 18, 36, 0.45) 38%, rgba(37, 18, 36, 0) 70%), linear-g | - |
| 3 | div#149939589311__moments_brands.shopify-section | 692-760 | section.m-brands bg=rgb(37, 18, 36)  | section.m-brands: border-bottom 1px rgb(205, 165, 83) |
| 4 | div#23149939589311__moments_shop.shopify-section | 760-1616 | section.m-moments bg=rgb(59, 30, 58)  | - |
| 5 | div#9589311__product_list_CYd9gQ.shopify-section.ui-test-product-list | 1616-2225 | div.section-background.color-scheme-4 bg=rgb(233, 207, 200)  | - |
| 6 | div#23149939589311__moments_gift.shopify-section | 2225-2909 | section.m-gift.m-tone--gift bg=rgba(0, 0, 0, 0) img=linear-gradient(155deg, rgb(145, 67, 115), rgb(108, 46, 84)) | - |
| 7 | div#3149939589311__moments_story.shopify-section | 2909-3754 | section.m-story bg=rgb(98, 64, 0)  | - |
| 8 | div#149939589311__section_xCc7xR.shopify-section.section-wrapper | 3754-4053 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 9 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 4053-4274 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 10 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 4274-4380 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 11 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 4380-4420 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 12 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 4420-4515 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/moments at 1440px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-100 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242)  | - |
| 2 | div#23149940506815__moments_page.shopify-section | 100-1620 | section.m-moments bg=rgb(59, 30, 58)  | - |
| 3 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 1620-1883 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 4 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 1883-1993 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 1993-2034 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 2034-2090 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/moments at 375px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-92 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 2 | div#23149940506815__moments_page.shopify-section | 92-1015 | section.m-moments bg=rgb(59, 30, 58)  | - |
| 3 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 1015-1236 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 4 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 1236-1342 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 1342-1382 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 1382-1477 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/about-us at 1440px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-100 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242)  | - |
| 2 | div#-23149939785919__about_story.shopify-section | 100-1158 | section.m-astory bg=rgb(250, 246, 242)  | - |
| 3 | div#23149939785919__about_brands.shopify-section | 1158-1409 | section.m-brow bg=rgb(250, 246, 242)  | section.m-brow: border-top 1px rgb(220, 185, 176); border-bottom 1px rgb(220, 185, 176) |
| 4 | div#3149939785919__about_explore.shopify-section | 1409-3143 | section.m-aex bg=rgb(250, 246, 242)  | - |
| 5 | div#-23149939785919__about_steps.shopify-section | 3143-3682 | section.m-steps bg=rgb(37, 18, 36)  | - |
| 6 | div#23149939785919__about_signup.shopify-section.section-wrapper | 3682-3958 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 7 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 3958-4221 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 8 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 4221-4331 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 9 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 4331-4372 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 10 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 4372-4428 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/about-us at 375px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-92 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 2 | div#-23149939785919__about_story.shopify-section | 92-569 | section.m-astory bg=rgb(250, 246, 242)  | - |
| 3 | div#23149939785919__about_brands.shopify-section | 569-1016 | section.m-brow bg=rgb(250, 246, 242)  | section.m-brow: border-top 1px rgb(220, 185, 176); border-bottom 1px rgb(220, 185, 176) |
| 4 | div#3149939785919__about_explore.shopify-section | 1016-3414 | section.m-aex bg=rgb(250, 246, 242)  | - |
| 5 | div#-23149939785919__about_steps.shopify-section | 3414-4078 | section.m-steps bg=rgb(37, 18, 36)  | - |
| 6 | div#23149939785919__about_signup.shopify-section.section-wrapper | 4078-4337 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 7 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 4337-4558 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 8 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 4558-4664 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 9 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 4664-4704 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 10 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 4704-4798 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/make-a-bundle at 1440px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-100 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242)  | - |
| 2 | div#late--23156044726463__bundle.shopify-section | 100-4426 | section.m-bundle bg=rgb(250, 246, 242)  | - |
| 3 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 4426-4689 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 4 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 4689-4799 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 4799-4840 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 4840-4896 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /pages/make-a-bundle at 375px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-92 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 2 | div#late--23156044726463__bundle.shopify-section | 92-6240 | section.m-bundle bg=rgb(250, 246, 242)  | - |
| 3 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 6240-6461 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 4 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 6461-6567 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 6567-6607 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 6607-6701 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /cart at 1440px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-100 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242) <br>div.menu-list__submenu.color-scheme-8.color-scheme-matches-parent bg=rgb(250, 246, 242)  | - |
| 2 | div#23149939491007__cart-section.shopify-section | 100-442 | div.section-background.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 3 | div#9491007__product_list_eDfjeW.shopify-section.ui-test-product-list | 442-1149 | div.section-background.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 4 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 1149-1412 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 1412-1522 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 1522-1563 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 7 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 1563-1619 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |

## /cart at 375px

| # | section | y | bands (painting elements) | on the join |
|---|---|---|---|---|
| 0 | div#196095__moments_announcement.shopify-section.shopify-section-group-header-group | 0-32 | aside.m-announce bg=rgb(59, 30, 58)  | - |
| 1 | header#149939196095__header_section.shopify-section.shopify-section-group-header-group.header-section | 32-92 | div.header__row.header__row--top.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 2 | div#23149939491007__cart-section.shopify-section | 92-429 | div.section-background.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 3 | div#9491007__product_list_eDfjeW.shopify-section.ui-test-product-list | 429-1303 | div.section-background.color-scheme-1 bg=rgb(250, 246, 242)  | - |
| 4 | footer#ions--23149939163327__footer.shopify-section.shopify-section-group-footer-group.section-wrapper | 1303-1523 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 5 | div#39163327__17650693132fb9bb25.shopify-section.shopify-section-group-footer-group.section-wrapper | 1523-1629 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 6 | footer#3149939163327__footer_PEjxWb.shopify-section.shopify-section-group-footer-group.section-wrapper | 1629-1669 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | - |
| 7 | div#s--23149939163327__utilities.shopify-section.shopify-section-group-footer-group.footer-utilities | 1669-1764 | div.section-background.color-scheme-3 bg=rgb(59, 30, 58)  | div.utilities.spacing-style: border-top 1px rgb(90, 66, 90) |
