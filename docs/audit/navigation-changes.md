# Navigation changes needed (nothing applied: menus are shared with the live theme)

The dev theme builds the new header and the Shop by Moment panel from the existing `main-menu` and existing collections.
No menu was edited. Differences between what you asked for and what the existing menu allows:

1. **Unisex**: the panel's "Discover" column should list For Her, For Him, **Unisex**, Home & Incense, Brands. There is no
   "Unisex" item in `main-menu`. Needs a new menu item (and a Unisex collection or filtered page). Not added.
2. **Extra Discover links**: Skin & Body, New Moments and Offers exist in `main-menu` and currently appear under Discover,
   because the dev theme lists every menu link that is not a primary item. If you want exactly the five you named, remove
   those three from the panel (a setting change in the theme, no store write) or from the menu (a store write: needs your approval).
3. **New arrivals**: "The edits" lists a New arrivals link only if a collection with the handle `new-arrivals` exists. If the handle
   differs, tell me the handle.
4. **Shop by Moment children**: the menu item has no child links, so the six moments in the panel come from the "Moment collections"
   handles (night-moment, gift-moment, all-day-moment, daily-moment, fresh-moment, love-moment). Unchanged store data.
5. **Primary items**: the five shown are controlled by the theme setting "Primary navigation items" (default
   `shop by moment,gifts,for her,for him,brands`), so the live menu can keep all nine items.
