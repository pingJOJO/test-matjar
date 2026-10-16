# Aftermarket Parts Storefront: Frontend Architecture & Design Specification

*Reference platform: fridayparts.com · Stack: Next.js (App Router), TypeScript, Tailwind CSS · Prepared October 10, 2026 for the frontend engineering team*

## 0. Scope, evidence and conventions

This spec comes from the live site’s public pages: home, a category listing (Injectors & Nozzle), an equipment-type listing (Tractor), the A–Z brands index, a brand landing page (Komatsu), the equipment-type index, one product page (a John Deere fuel injector, RE529118) and the Member Club page. Every statement is tagged:

- **\[Observed\]**: seen on the live pages.
- **\[Proposed\]**: our recommendation, either because the reference doesn’t expose it in its public HTML or because we deliberately improve on it.

**Blind spots, stated up front so gaps aren’t mistaken for facts**

1. **No computed CSS.** Only page content and structure were readable, not stylesheets. Colors, fonts and spacing in §1 are \[Proposed\] tokens built to WCAG AA, not measured values. §1.6 is a five-minute DevTools audit if you need pixel-level parity.
2. **Cart and checkout block automated access**, so §3.4 is \[Proposed\] end to end.
3. **Interactive overlays** (Select Model, search suggestions, mega menu, Filters and Sort panels, footer links) weren’t visible in the static content. Their internals in §2 to §4 are \[Proposed\], built around the entry points the site does expose.
4. **Backend inference.** Image paths (`/media/catalog/product/…`) and `?p=` pagination suggest a Magento-family catalog. Treat that as inference; the contracts in §5 are backend-agnostic.

Rebuild the patterns, not the brand: use your own name, logo, photography, copy and catalog data.

### Reference teardown at a glance

| Area | \[Observed\] pattern | Implication for the rebuild |
| --- | --- | --- |
| Global nav | Top bar: logo, **Select Model**, ship-to selector (“US”), Contact, Cart. Second row: Category, All Brands, All Equipment, Must Buy, Lithium Battery, Member Club (flame icon), About. A campaign link (“10th Anniversary” to /deals) appears on some pages only. | CMS-driven nav items; a global machine selector in the header. |
| Taxonomy | Three parallel axes: **part category** (9 top-level groups), **equipment type** (10 groups, about 40 types), **brand** (A–Z index at `/all-brands/for-{brand}`). | Model them as independent facets, not one tree. |
| Listing | 20 products per page, numbered pagination (`?p=N`), **Filters** and **Sort** controls, a long SEO text block with “View More”. | Server-render, URL-driven state, SEO copy as CMS content. |
| Product card | Discount pill (−13%), status badge (CLEARANCE or MUST BUY), keyword-heavy title with OEM numbers and model lists, sale price plus struck list price, “Member Price” tag, Add to Cart. No rating or stock on the card. | Keep it dense; add a fit chip and a stock cue. |
| Product page | Breadcrumb, five-image gallery, buy box (price, member cashback strip, ship-to, SKU, stock, Buy Now / Add to Cart / Wish List), four trust items, anchor tabs (Details, Highlights, Shipping, Reviews, Q&A), fitment tables by machine model and by engine with OEM replacement numbers. | Fitment data is the core content of the PDP. |
| Pricing | Dual membership: Personal (V0–V4, points worth 2–5%) and PRO (PRO1–PRO14, up to 10% off by spend band). | Price depends on the viewer; plan caching around it. |
| Social proof | Google store rating 4.4/5.0 from 3,840 reviews, review cards, three editorial “pride” cards, Facebook community banner, blog teasers, coupon newsletter. | Reusable trust modules for home and cart. |
| URLs | Product pages sit at the root (`/{keyword-slug}`), categories at `/{slug}`, equipment at `/equipment-type/{slug}`, brands at `/all-brands/for-{brand}`. | Needs a slug resolver (see §7). |

**Observed patterns we deliberately won’t copy:** the viewport tag `maximum-scale=1, user-scalable=no` (blocks pinch-zoom and fails WCAG 1.4.4); two links to the same URL on every product card (image and title); keyword-stuffed image alt text; 20 to 100 model numbers crammed into product titles instead of structured fitment; OEM numbers listed twice on the PDP (with and without hyphens).

## 1. Design System & Tokens

### 1.1 Principles \[Proposed\]

- Dense but legible: titles are long and part numbers are the content.
- Price, stock and fit must be scannable in two seconds.
- Semantic tokens only. The brand color lives in one variable, so the palette can be swapped without touching components.
- AA contrast everywhere. Never signal stock or fit by color alone.

### 1.2 Color tokens \[Proposed\]

Industrial-neutral palette on Tailwind’s gray scale, one accent, and a strict semantic layer for commerce states.

| Token | Hex | HSL | Use | Contrast |
| --- | --- | --- | --- | --- |
| `--background` | #FFFFFF | 0 0% 100% | Page, cards | n/a |
| `--foreground` | #111827 | 221 39% 11% | Body text, headings | 17.7:1 on white |
| `--muted` | #F3F4F6 | 220 14% 96% | Section bands, skeletons, table zebra | n/a |
| `--muted-foreground` | #6B7280 | 220 9% 46% | Secondary text, struck list price | 4.8:1 on white |
| `--border` | #E5E7EB | 220 13% 91% | Dividers, card outlines (decorative only) | n/a |
| `--control-border` | #8B93A1 | 218 10% 59% | Input, checkbox and select borders | 3.1:1 (meets WCAG 1.4.11) |
| `--ink` | #111827 | 221 39% 11% | Footer, announcement bar, tooltips | 17.7:1 with white text |
| `--primary` | #C2410C | 17 88% 40% | Primary CTA fill, focus ring, active nav | 5.2:1 with white text |
| `--primary-hover` | #9A3412 | 15 79% 34% | CTA hover and pressed | 7.3:1 with white text |
| `--primary-subtle` | #FFEDD5 | 34 100% 92% | Selected facet, search-match highlight, hover tint | n/a |
| `--sale` | #DC2626 | 0 72% 51% | Discount pill and CLEARANCE badge fill | 4.8:1 with white text |
| `--price-sale` | #B91C1C | 0 74% 42% | Sale price text | 6.5:1 on white |
| `--success` | #15803D | 142 72% 29% | In stock, Exact fit | 5.0:1 on white |
| `--warning` | #B45309 | 26 90% 37% | Low stock, Likely fit | 5.0:1 on white |
| `--danger` | #B91C1C | 0 74% 42% | Out of stock, May not fit, form errors | 6.5:1 on white |
| `--info` | #1D4ED8 | 224 76% 48% | Links, info notices | 6.7:1 on white |
| `--member` | #0F766E | 175 77% 26% | Member Price tag, points strip | 5.5:1 on white |

Subtle backgrounds for notices and chips: success `#DCFCE7` (141 84% 93%), warning `#FEF3C7` (48 96% 89%), danger `#FEE2E2` (0 93% 94%). Pair each with its strong token for the text.

Rules:

- `--primary` is a placeholder for your brand color; swap it in one place. Keep white-on-fill at 4.5:1 or better. For a bright brand hue (yellow, amber), put ink text on the fill instead (`#111827` on `#F59E0B` is about 8.3:1).
- Every state color is paired with an icon and a text label.
- Contrast figures come from the WCAG formula applied to these exact hex values. Re-check after any brand swap.
- Light theme only at launch (the reference declares a white theme color). A dark theme can come later by remapping the same semantic names.

### 1.3 Typography \[Proposed\]

**Families.** Inter (variable) through `next/font/google` (`display: 'swap'`, latin and latin-ext) for the UI. JetBrains Mono for SKUs and OEM numbers, with `font-variant-numeric: tabular-nums slashed-zero`. Part numbers mix 0/O and 1/I/l, so a monospace face with a slashed zero prevents mis-orders.

| Role | Size mobile / desktop | Line height | Weight | Tracking | Notes |
| --- | --- | --- | --- | --- | --- |
| Display | 32 / 48 px | 1.15 / 1.1 | 700 | -0.02em | Hero headline only |
| H1 | 24 / 32 px | 1.3 / 1.25 | 700 | -0.01em | One per page |
| H2 | 20 / 24 px | 1.35 | 600 | -0.005em | Section titles |
| H3 | 18 / 20 px | 1.4 | 600 | 0 | Card group and panel titles |
| H4 | 16 px | 1.5 | 600 | 0 | Facet group titles |
| H5 | 14 px | 1.5 | 600 | 0 | Table headers |
| H6 / eyebrow | 12 px | 1.33 | 600 | +0.06em, uppercase | Labels above headings |
| Body L | 16 px | 1.5 | 400 | 0 | PDP description, SEO copy |
| Body | 14 px | 1.43 | 400 | 0 | Cards, lists, tables |
| Caption / microcopy | 12 px | 1.33 | 500 | +0.01em | Badges, helper text, legal |
| SKU / OEM label | 12–13 px mono | 1.4 | 500 | 0 | Tabular figures, slashed zero |
| Price (card / PDP) | 18 / 28 px | 1.33 / 1.2 | 700 | 0 | Tabular figures |
| List price (struck) | 14 px | 1.43 | 400 | 0 | `text-muted-foreground line-through` |

Product titles on cards: 14 px medium with a 3-line clamp (the reference’s titles run to about 150 characters). On the PDP, show a short display title in the H1 and keep the long keyword title for metadata.

### 1.4 Spacing, radii, elevation, layering and motion \[Proposed\]

- **Spacing:** Tailwind’s 4 px grid. Steps in use: 4, 8, 12, 16, 24, 32, 48, 64, 80. Page container `max-w-[1440px]` with 16 / 24 / 32 px side padding (base / md / lg). Section rhythm 48 px on mobile, 80 px on desktop. Grid gaps 12 px on mobile, 16 px on desktop, 24 px between sidebar and grid.
- **Breakpoints:** Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536). Navigation collapses to a drawer below lg; the PLP sidebar becomes a bottom sheet below lg; the product grid is 2 columns on mobile, 3 from md, 4 from xl.
- **Hit targets:** 44 px minimum on touch. Icon buttons are 40 px visually with a 44 px hit area.
- **Radii:** sm 4 px (tags), md 6 px (buttons, inputs), lg 8 px (cards, popovers), xl 12 px (dialogs, drawers, sheets), full (pills, dots).
- **Elevation:** e0 none (flat content). e1 `0 1px 2px rgb(0 0 0 / .06)` for cards at rest and sticky bars. e2 `0 4px 12px rgb(0 0 0 / .08)` for card hover and small popovers. e3 `0 12px 32px rgb(0 0 0 / .16)` for mega menu, search panel, dropdowns and toasts. e4 `0 24px 64px rgb(0 0 0 / .24)` for dialogs and drawers, always over a `black/50` scrim.
- **Layering:** announcement 30, PDP section nav 35, header 40, sticky mobile buy bar 45, mega menu 50, drawer or sheet 60, dialog 70, toast 80.
- **Motion:** 150 ms ease-out for hover and focus, 200 ms for drawers and sheets, 250 ms for accordions. `motion-reduce` disables transforms, carousel autoplay and zoom easing.

**Component token map**

| Component | Radius | Shadow | Size and padding | Border and focus |
| --- | --- | --- | --- | --- |
| Button (md) | md | none | h-10 px-4 (sm: h-8 px-3, lg: h-12 px-6) | Outline variant uses `--control-border`; focus ring 2 px `--primary` with 2 px offset |
| Input / select | md | none | h-10 px-3 (h-11 on mobile) | 1 px `--control-border`; same focus ring |
| Product card | lg | e1, e2 on hover | p-3 mobile, p-4 desktop | 1 px `--border` |
| Badge / pill | full (tags: sm) | none | h-5 px-2, 12 px / 500 | none |
| Dropdown / popover | lg | e3 | p-1 to p-2 | 1 px `--border` |
| Mega menu | xl on bottom corners | e3 | p-6 | 1 px `--border` on top edge |
| Dialog | xl | e4 | p-6, max-w 560 px | scrim `black/50` |
| Drawer / sheet | xl on inner edge | e4 | sticky header and footer, scrolling body | scrim `black/50` |
| Toast | lg | e3 | p-3 | 1 px `--border` |

### 1.5 Tokens as code \[Proposed\]

Tailwind CSS v4 (CSS-first). On Tailwind v3, move the same values into `theme.extend` in `tailwind.config.ts`. HSL channels keep the file compatible with shadcn/ui conventions.

```css
@import 'tailwindcss';

:root {
  --background: 0 0% 100%;
  --foreground: 221 39% 11%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --border: 220 13% 91%;
  --control-border: 218 10% 59%;
  --ink: 221 39% 11%;
  --primary: 17 88% 40%;
  --primary-hover: 15 79% 34%;
  --primary-foreground: 0 0% 100%;
  --primary-subtle: 34 100% 92%;
  --sale: 0 72% 51%;
  --price-sale: 0 74% 42%;
  --success: 142 72% 29%;
  --warning: 26 90% 37%;
  --danger: 0 74% 42%;
  --info: 224 76% 48%;
  --member: 175 77% 26%;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-border: hsl(var(--border));
  --color-control: hsl(var(--control-border));
  --color-ink: hsl(var(--ink));
  --color-primary: hsl(var(--primary));
  --color-primary-hover: hsl(var(--primary-hover));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-subtle: hsl(var(--primary-subtle));
  --color-sale: hsl(var(--sale));
  --color-price: hsl(var(--price-sale));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-danger: hsl(var(--danger));
  --color-info: hsl(var(--info));
  --color-member: hsl(var(--member));

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jbmono), ui-monospace, SFMono-Regular, monospace;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  --shadow-e1: 0 1px 2px rgb(0 0 0 / 0.06);
  --shadow-e2: 0 4px 12px rgb(0 0 0 / 0.08);
  --shadow-e3: 0 12px 32px rgb(0 0 0 / 0.16);
  --shadow-e4: 0 24px 64px rgb(0 0 0 / 0.24);
}
```

### 1.6 Measuring the reference (optional, five minutes)

If the team wants measured values instead of the proposed tokens, run this in the DevTools console on a PDP, then on a PLP. Convert the `rgb()` output to hex and HSL, cluster near-duplicates, and replace the §1.2 table. Chrome’s CSS Overview panel gives the full color and font inventory in one pass.

```js
const sel = 'header, h1, h2, h3, button, a, [class*=price], [class*=badge], [class*=tag], input, footer';
const props = ['color', 'backgroundColor', 'borderColor', 'borderRadius', 'boxShadow', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'padding'];
const rows = [...document.querySelectorAll(sel)].slice(0, 150).map((el) => {
  const cs = getComputedStyle(el);
  return {
    el: el.tagName + '.' + String(el.className).split(' ')[0],
    text: el.textContent.trim().slice(0, 24),
    ...Object.fromEntries(props.map((p) => [p, cs[p]])),
  };
});
console.table(rows);
```

## 2. Global Architecture & Layout

### 2.1 Header

| Band | Contents | Behavior |
| --- | --- | --- |
| 0. Announcement \[Proposed\] | One line of shipping or promo copy, up to 3 rotating messages, dismiss control | 36 px, `--ink` background, not sticky, dismissal remembered for 7 days, no rotation under reduced motion |
| 1. Main bar \[Observed items: logo, Select Model, ship-to, Contact, Cart\] | Logo · global search · Select Model · ship-to · Account · Track order · Contact · Cart with count badge | Sticky. On mobile it hides on scroll down and returns on scroll up |
| 2. Primary nav \[Observed\] | Category (mega menu) · All Brands · All Equipment · Must Buy · Lithium Battery · Member Club (flame icon) · About | Items and one campaign slot come from the CMS |

Utility behaviors:

- **Ship-to** \[Observed: “US”\]: popover with country and postal code. Drives shipping estimates and tax display. Keep the selection client-side so pages stay statically cacheable. If prices differ per region, use a `[region]` route segment (`/us/...`) instead of reading cookies in server components.
- **Currency and language** \[Proposed\]: expose only what you really support. `next-intl` plus `hreflang` for languages; `Intl.NumberFormat` for currency.
- **Account** \[Proposed\]: signed out shows Sign in, Create Personal account and Create PRO account (mirrors Member Club). Signed in shows Orders, Track order, My Garage, Wish List, Points, Sign out.
- **Order tracking** \[Proposed\]: `/orders/track` takes an order number and email, no login.
- **Select Model** \[Observed entry point\]: opens the Part Finder (§4.1) in a dialog, or a sheet on mobile. With an active machine the button becomes a chip, for example “Kubota KX080-4 ✕”.
- **Cart** \[Observed\]: a real link to `/cart` that works without JavaScript and opens the mini-cart drawer when JavaScript is available.

Mobile: row 1 is menu, logo, search, cart. Search expands to a full-width field. An active machine shows as a slim strip under the header (“Parts for Kubota KX080-4 · Change”). Ship-to, account and contact links move to the bottom of the menu drawer.

### 2.2 Global search bar

Anatomy \[Proposed\]: a combobox with a leading magnifier icon, the placeholder “Search by part number, OEM number or machine model”, a clear (×) button that appears when the field has text, and Enter to submit. The reference’s own copy tells shoppers to enter a part number, name or model in the top search bar, so all three must work. The suggestion panel is anchored under the field on desktop (max 720 px, e3 shadow) and is a full-screen overlay on mobile.

Panel groups, in order: (1) exact part-number match, (2) products, (3) machine models, (4) categories, (5) brands, (6) recent searches when the field is empty. Keyboard, debounce and highlight rules are in §4.3. Data comes from `GET /api/search/suggest?q=&machine=`, edge-cached with `s-maxage=60, stale-while-revalidate=300`.

### 2.3 Mega menu

**\[Observed\]** The header has a Category trigger. Its panel wasn’t readable, but the homepage’s Find Parts by Category section shows the 9 top-level groups, and the first group (Engine Spare Parts) lists 18 sub-categories plus a View All link. The menu below is **\[Proposed\]** around that taxonomy.

```
Category (trigger)
├─ Engine Spare Parts        → Injectors & Nozzle, Injection Pump, Fuel Pump, Crankshaft, Cylinder Head, Overhaul Kits, ...
├─ Electrical Parts
├─ Hydraulic & Pneumatic Parts
├─ Transmission & Undercarriage Parts
├─ Seals, Filters & Maintenance Parts
├─ Cab & Body Parts
├─ HVAC Parts
├─ Tools and Accessories
└─ Machinery & Equipment
All Equipment   → Engine · Construction · Agricultural · Aerial & Lifting · Vehicles · Marine · Lawn & Garden · Industrial · Power · Others
All Brands      → A–Z index
```

Your brief asks for Brand → Machine Type → Part Category. Add it as a second root, “Shop by Brand”, since the reference’s nav has no such path:

| Column | Content | Source |
| --- | --- | --- |
| Left rail | Top 12 brands by product count, then “All brands A–Z” | `MachineMake[]` where `kind` is `machine_oem` or `engine_oem` |
| Middle | Machine types that exist for the hovered brand (Excavator, Loader, Tractor…) | `GET /api/navigation/brand/{slug}` |
| Right | Top part categories for that brand and machine type, plus a View all link | same endpoint |

URL for the deepest link: `/brands/{brand}/{machine-type}/{category}`. Brand × type × category is a facet space, not a tree: index only combinations with at least N products, and send everything else to the filtered PLP with `noindex`.

Behavior:

- Render the whole menu as real server-side `<a>` links so crawlers and no-JS users see it. Lazy-load only the images.
- Hover intent: open after about 120 ms, close after about 200 ms, with a safe triangle so diagonal mouse moves don’t flicker. Click, Enter and Space also toggle (touch and keyboard).
- Keys: ↓ and ↑ move through the left rail, → enters the next column, ← goes back, Esc closes and returns focus to the trigger, Tab continues in DOM order.
- Panel max height 70 vh with internal scroll. Radix NavigationMenu or a custom disclosure pattern both work; avoid ARIA `menu` roles, which promise behavior that site navigation doesn’t have.
- Mobile: full-height drawer with drill-down (stack navigation), a back button, the parent name as the title, and 56 px rows.
- Data: `GET /api/navigation` cached under the tag `navigation`, revalidated on demand when the taxonomy changes.

### 2.4 Mini-cart drawer \[Proposed\]

The reference links to a full cart page; a drawer shortens the add-to-cart loop.

- Right-side sheet, 420 px wide (full width below sm), e4 shadow over a scrim. It opens after Add to Cart on the PDP. PLP quick-add shows a toast with a View cart link instead, so browsing isn’t interrupted.
- Contents: “Your cart (3)” header with close; line items (80 px thumbnail, 2-line title clamp, mono SKU, quantity stepper, remove); a fit chip per line when a machine is active; shipping note (“Shipping calculated at checkout”, or the freight notice from §3.4); subtotal; member-savings line; **Checkout** (primary) and **View cart** (secondary).
- Behavior: focus moves to the drawer heading and is trapped; Esc and scrim click close; focus returns to the trigger; body scroll is locked; an `aria-live='polite'` region announces “Added: {title}. Cart subtotal {amount}.” Quantity changes and removals are optimistic with rollback, and removal offers an undo toast.
- Empty state: a Select Model button and the top categories.
- Tech: shadcn `Sheet` (Radix Dialog). A small Zustand store holds `isOpen`; cart data stays in TanStack Query under `['cart']`.

### 2.5 Footer

**\[Observed\]** Only the newsletter strip was readable: coupon artwork, email field, “GO!” button and a consent line linking to the Privacy & Cookie Policy. Everything else is **\[Proposed\]**.

Layout, top to bottom: newsletter strip, link clusters, SEO silos, trust and payments, legal bar.

| Cluster | Suggested links |
| --- | --- |
| Shop | All Categories, All Brands, All Equipment, Must Buy, Deals, Lithium Battery |
| Support | Contact a parts specialist, Track order, Shipping info, Returns (90-day), Warranty (1-year), FAQ |
| Member Club | Personal membership, PRO membership, Rewards program |
| Company | About, Sustainability, Trade shows, Blog |
| Legal | Privacy & Cookie Policy, Terms, Accessibility |

- **SEO silos:** three plain link lists (popular brands ×12, popular equipment ×8, popular parts ×12), server-rendered, inside `<details>` on mobile. This mirrors the reference’s strategy of linking brand and equipment landing pages from everywhere.
- **Newsletter:** a Server Action with Zod validation, rate limiting and a honeypot field; inline success and error states; double opt-in; the coupon arrives by email, not in the page.
- **Trust:** Google reviews badge (4.4/5.0, 3,840 reviews) \[Observed on home\]; payment logos (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay) as inline SVG with `aria-label`s; carrier logos; a security note.
- **Legal bar:** copyright, policy links, and a second ship-to selector for mobile.

## 3. Core E-Commerce Pages (Atomic Design)

Directory convention: `components/atoms`, `components/molecules`, `components/organisms`; page-level composition lives in `app/` and `features/`.

| Layer | Components shared across pages |
| --- | --- |
| Atoms | Button (cva variants: primary, secondary, outline, ghost, link; sizes sm, md, lg, icon), IconButton, Badge (discount, clearance, must-buy, member, stock, fit), Price, SkuLabel (mono with copy), StarRating, QuantityStepper, Chip, Checkbox, Switch, Input, Select, Skeleton, ProductImage |
| Molecules | ProductCard, SearchField, Breadcrumbs, FacetGroup, ActiveFilterChips, SortSelect, ViewToggle, PaginationBar, PriceBlock, StockStatus, FitBadge, TrustItem, ReviewCard, CategoryTile, BrandTile, MachineTile, MemberStrip, ShipToSelect |
| Organisms | Header, MegaMenu, MiniCart, Footer, PartFinder, HeroCarousel, CategoryTabs, FilterSidebar and FilterSheet, ProductGrid, ProductGallery, BuyBox, FitmentTable, ReviewsPanel, QAPanel, CartLines, OrderSummary, CheckoutForm |

### 3.1 Homepage

Section names and order are \[Observed\] unless tagged; the Spec column is \[Proposed\].

| # | Section | Components | Spec |
| --- | --- | --- | --- |
| 1 | Header | Header, MegaMenu | §2 |
| 2 | Hero banners: five linked banners (tractor category, USA warehouse shipping, brand story, water pump, Member Club) | HeroCarousel (Embla), banner image, CTA link | 16:5 on desktop and 4:3 on mobile via art-directed `<picture>`; autoplay 6 s, paused on hover, focus and reduced motion; dots and arrows; slide 1 gets `priority` and `fetchPriority='high'`; each banner is one link with an accessible name |
| 3 | Part Finder \[Proposed inline; the reference exposes it only as the header Select Model plus Find Parts by Machine tiles\] | PartFinder (inline variant) | One row on desktop: Equipment type › Make › Model › Engine or Year (optional) › Find Parts. Stacked on mobile. Same state machine as the dialog (§4.1) |
| 4 | Value strip \[Observed on the PDP, Proposed here\] | TrustItem ×4 | 100k+ customers, 1-year warranty, 90-day returns, 24/7 service |
| 5 | Find Parts by Category | CategoryTabs, CategoryTile | 9 tabs; each panel is a grid of icon tiles (18 for Engine Spare Parts, from Injectors & Nozzle to Belts) plus View All. Radix Tabs, horizontal scroll-snap on mobile; render inactive panels hidden in the DOM so the links stay crawlable |
| 6 | Find Aftermarket Parts by Brand | BrandTile grid | Logo wall (CAT, Komatsu, Kubota, John Deere…): 6 columns desktop, 3 mobile; links to `/brands/{slug}`; All brands link |
| 7 | Find Parts by Machine | MachineTile | Tractor, Excavator, Loader, Forklift, Generator, AWP, Engine, Transport Refrigeration, View All |
| 8 | What Our Customers Are Saying | RatingSummary, ReviewCard carousel | Google rating 4.4/5.0, 3,840 store reviews, external See All Ratings link. Cards: source icon, name, date, 5.0, excerpt clamped to 4 lines. Embla at 1, 2 and 4 per view. Don’t add AggregateRating markup for the store itself (Google ignores self-serving review markup) |
| 9 | Why Take Pride in What We Do | EditorialCard ×3 | Sustainability (UPS partnership), trade shows, expert video reviews. Image, title, subtitle, text link. Open video in a lightbox rather than leaving the site |
| 10 | Community banner | CommunityBanner | Facebook group call to action |
| 11 | Offers pair (the reference calls it Find Your FridayParts; use your own label) | PromoPair | Two large CTAs: See All Offers, Shop With Pros |
| 12 | More Reasons to Love Us | ArticleCard ×3 | Blog teasers linking to `/blog` |
| 13 | Newsletter | NewsletterForm | Coupon artwork, email field, submit, consent line |
| 14 | Footer | Footer | §2.5 |

Rendering: ISR with a 10-minute revalidate plus on-demand tag revalidation (`home`). Header, hero and finder are server-rendered; reviews and blog stream under `Suspense`. Only PartFinder, HeroCarousel, CategoryTabs and the review carousel are client components. LCP target: the first hero image, AVIF, 120 KB or less on mobile.

### 3.2 Product listing page (PLP) and search results

**Page order** \[Observed\]: category banner image, H1, promo line (“Up to 53% OFF Selected Parts”), Filters and Sort controls, product grid (20 per page), numbered pagination (`?p=N`), SEO copy with H2s and a View More expander. No breadcrumb appeared on the listings I read; add one \[Proposed\] for orientation and `BreadcrumbList` markup.

**Facet sidebar** \[Proposed; the reference collapses everything behind a Filters button\]. From lg up: a sticky 272 px sidebar. Below lg: a bottom sheet opened by a Filters (n) button, with an Apply button and a live result count.

| Facet | Control | Behavior |
| --- | --- | --- |
| Compatible brand | Checkbox list with in-facet search | Counts beside each option; top 8, then Show all |
| Machine model / engine | Async typeahead combobox | Thousands of values, so never render them all; selected values appear as chips |
| Part type | Two-level checkbox tree | Child categories of the current category |
| Equipment type | Checkbox list | Grouped by equipment group |
| Price | Dual slider plus min and max inputs | Commits on release or blur; minor-unit integers in the URL |
| Availability | Switch: In stock only | Off by default; stock is also shown on every card |
| Ships from | Checkbox: US warehouse, Overseas | Backed by the reference’s emphasis on fast local stock shipping |
| Deals | Switch: On sale or Clearance | Uses `pricing.sale` or the CLEARANCE badge |

Semantics: OR within a facet, AND across facets. Each facet’s counts are computed with that facet’s own selection excluded, so shoppers can see alternatives. Zero-count options stay visible but disabled (`aria-disabled`) for layout stability. An active machine applies as a removable chip, “Fits: KX080-4”.

**State.** The URL is the single source of truth, for example `/injectors-nozzle?brand=kubota,john-deere&price=0-20000&stock=1&sort=price_asc&p=2&view=list`. Use `nuqs` for typed parsers, `router.replace(url, { scroll: false })` inside `startTransition`, a 250 ms debounce on the price slider, and reset `p` to 1 on any filter or sort change.

**Controls bar.** Left: “1–20 of 3,412 parts”. Middle: ActiveFilterChips with Clear all. Right: Sort (Relevance for search, Best selling for categories, Price low to high, Price high to low, Newest, Biggest discount), a grid or list toggle, and per page (20, 40, 80). Mobile: a sticky bar with **Filters (n)** and **Sort** buttons \[Observed labels\].

**Product card anatomy**

| Region | Spec |
| --- | --- |
| Media | 1:1, `object-contain` on white; second image on hover for pointer devices. Top-left discount pill (−13%) \[Observed\]. Optional wish-list heart top-right |
| Badges | CLEARANCE and MUST BUY \[Observed\]; Bundle for multi-packs \[Proposed\] |
| Title | 14 px medium, 3-line clamp. One stretched link covers the card (the reference renders two links per card) |
| Part number | Primary OEM number in mono, for example “OEM RE529118” \[Proposed\] |
| Fit chip | Only when a machine is active (§4.2) |
| Price | Sale price 18 px bold in `--price-sale` when discounted, list price struck through, “Member Price” tag in `--member` when a member price is resolved \[Observed label\]. Show “per set of 4” when `packSize` is above 1 |
| Stock cue | Dot plus “In stock”, “Low stock” or “Ships in 7–14 days” \[Proposed\] |
| Rating | Only when `count` is at least 1 |
| CTA | Full-width **Add to Cart**, h-10 \[Observed\]. After a click it becomes a quantity stepper with undo |

List view: three columns (140 px image, title and OEM chips, price and CTA). Loading: 20 skeleton cards with the same dimensions so CLS stays at 0. Empty: “No parts match your filters” with removable chips, suggestions and a contact-a-specialist link (the reference leans on this fallback throughout).

**SEO.** Self-referencing canonical on every paginated page; canonical to the unfiltered URL for sorted or filtered variants; `noindex, follow` on filtered combinations except the whitelisted brand × category pages; `ItemList` JSON-LD on page 1. Implement View More with the full text in the DOM and a CSS line clamp or `<details>`, never by fetching on click.

**Search results** (`/search?q=`) reuse the same template. Add a “Results for ‘q’” header with a did-you-mean line. When the query is an exact part-number hit, pin an “Exact match for OEM 095000-8801” banner above the grid with the matched product and its cross-references. The zero-results state suggests trying the number without dashes and links to a specialist.

**Performance.** The grid renders on the server. Client islands: FacetPanel, QuickAdd, FitBadge. Images use `sizes='(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw'` with `priority` on the first row only. Set `prefetch={false}` on cards below the first row and prefetch on hover instead.

### 3.3 Product detail page (PDP)

**Layout** \[Proposed\]. From lg up: two columns, gallery (58%) and buy box (42%, sticky below the header). Below lg: stacked, with a full-bleed swipe gallery.

**Block order** \[Observed\]: breadcrumb (Home › Engine Spare Parts › Fuel System › Injectors & Nozzle), gallery and buy box, four trust items, section navigation, Product Details, Product Highlights (fitment tables), Shipping, Customer Reviews, Questions and Answers.

**Gallery.** \[Observed\] Five 460×460 renditions served by an image service that takes width and height query parameters. \[Proposed\] behavior:

- Main image `aspect-square`, `object-contain`, `priority`, `sizes='(min-width:1024px) 560px, 100vw'`. Write an image loader for your CDN that emits width variants (460, 920, 1200).
- Thumbnails: 5 to 8, in a vertical Embla rail on desktop and a horizontal one on mobile. Arrow keys change the selection; the selected thumbnail has a 2 px `--primary` ring.
- Zoom: on pointer devices, hover shows a 2.5× lens that follows the pointer (only when the source is at least 1200 px wide). Click opens a lightbox dialog with pinch and double-tap zoom, swipe, ← and →, Esc, focus trap and a counter (“2 / 5”). Preload the neighbors.
- Alt text: descriptive and unique per image (“Fuel injector RE529118, side view”). The reference’s alt text is a keyword list; don’t copy that.
- Optional slots for video and a 360° view.

**Buy box, top to bottom** \[Observed contents unless tagged\]:

1. Badges: CLEARANCE and the discount pill (−15%).
2. H1 with a short display title, plus a one-line “Fits” summary from `fitmentSummary` (“John Deere 4045 and 6068 engines · 120+ machines”) \[Proposed\]. The long keyword title stays in metadata.
3. Reviews link: “Add Your Review” when there are none; stars and count otherwise.
4. Identifiers \[Proposed\]: SKU in mono with a copy button, the first three OEM numbers and a “+43 more” anchor to the cross-reference list. The reference shows only “SKU#”.
5. Price block: sale price 28 px bold in `--price-sale`, struck list price, “You save US$21.37 (15%)” \[Proposed\], a “Member Price” tag with a tooltip that explains tiers, and the member strip: “Get at least 2% points for cashback & save up to 10%! View Details”, linking to `/member-club`.
6. FitBadge banner, full width (§4.2) \[Proposed\].
7. Advisory callout \[Proposed placement\]: the reference buries “Replace as a SET for Best Results” inside Product Details; render `advisories` as an info notice above the CTAs.
8. Shipping estimator: “Shipping to” with a country or ZIP control, and “Choose options for shipping rates”. Inline result: methods, price, ETA and origin (US warehouse or overseas). Freight-class items show “Freight quote at checkout”. Debounced; cached per SKU and destination.
9. Stock: “In Stock” with a green dot. Low stock shows “Only 3 left”; backorder shows lead time; out of stock swaps the CTAs for a “Notify me” form and related alternatives \[Proposed\].
10. Quantity stepper \[Proposed\]: min 1, max `maxQuantity`, numeric input with `inputMode='numeric'`, pack-size hint.
11. CTAs: **Add to Cart** (primary), **Buy Now** (outline; goes to express checkout), **Add to Wish List** (ghost with icon).
12. Trust row, four items, each with an icon, a bold label and one line: 100k+ Customers’ Top Choice, 1 Year Warranty, 90-Day Return, 24/7 Service. Two by two on mobile.

Mobile: a sticky bottom bar (price and Add to Cart) appears once the buy box scrolls out of view; honor the safe-area inset and hide it while the keyboard is open.

**Section navigation** \[Observed labels: Product Details, Product Highlights, Shipping, Customer Reviews, Questions and Answers\]

- One long page with a sticky anchor bar under the header and scroll-spy via IntersectionObserver (`rootMargin: '-30% 0px -60% 0px'`). Give each section a `scroll-margin-top` equal to header plus bar height, and update the hash with `history.replaceState`.
- Every section is in the server-rendered DOM (good for SEO). Below md, convert to accordions (Radix Accordion, `type='multiple'`, Details open by default).
- This is navigation, not a tab widget: use `<nav aria-label='Product sections'>` with `aria-current='true'` on the active link, not an ARIA `tablist`.

**Product Details**

- Advisories, description, and the **OEM cross-reference**: chips grouped by brand (the reference groups “For JOHN DEERE” and “For Denso”), each with a relation label (OEM, cross-reference, superseded by). Show the first 12, then “Show all 46”. Click copies. Add a search box above 40 entries. Hide the normalized variants: the reference prints each number twice (095000-880 and 095000880); keep the normalized form in the search index only.
- **Specs:** a two-column definition list built from `SpecGroup[]`.
- **Applications** \[Observed: grouped by machine type: Forwarder, Combine, Tractor, Excavator, Skidder, Sprayer, Motor Grader, Loader, Feller Buncher, Cotton Picker, Dozer\]: collapsible groups with counts and model chips.

**Product Highlights = fitment tables** \[Observed: two tables, “Compatible Model Brand | Model Number | Replacement Part Number” and the same by engine\]

- Two tables: Compatible machines and Compatible engines. Columns: Brand, Models or engines, Replacement numbers.
- One John Deere row lists 40 to 120+ codes, so render codes as wrapped mono chips with a “+N” expander, and paginate or virtualize past 100 rows (TanStack Table plus TanStack Virtual).
- Controls \[Proposed\]: a filter input (“Search model or engine code”), make filter chips, and CSV export for professional buyers.
- When a machine is active, highlight its row (`aria-current='true'`, `--success` tint) and scroll it into view. Empty state: “Not listed? Ask a parts specialist.”

**Shipping** \[Observed: “Ships to” and “Delivery”\]: mirrors the estimator and adds the policy summary (1-year warranty, 90-day returns) and freight notes.

**Customer Reviews** \[Observed: aggregate score, five-bar distribution, Write a Review\]: score and bars (each bar is a button that filters), sort, verified-purchase badge, photo reviews. With zero reviews show an empty state (“No reviews yet. Be the first”) instead of “0 out of 5” over five empty bars, as the reference does. Writing a review requires sign-in or an order number plus email.

**Questions and Answers** \[Observed: loads lazily and shows “Loading…”\]: fetch on first intersection (`useInView` with `triggerOnce`), show a skeleton, offer an Ask a question form, and badge staff answers.

**Related** \[Proposed\]: “Same part, other quantities” (the observed catalog sells 1-, 3- and 4-piece sets as separate listings, so link them through `packVariants`), “Frequently bought together” for kits, and Recently viewed.

**Structured data** \[Proposed\]: `Product` (name, image list, sku, mpn, brand, description, `offers` with price, currency, availability, `itemCondition: NewCondition`, url), `BreadcrumbList`, and `AggregateRating` only when the review count is above 0. \[Observed\] Open Graph already carries product availability, price and currency.

**Rendering.** Static with ISR (1 hour) plus on-demand tag revalidation (`product:{id}`); `generateStaticParams` for the top products and on-demand ISR for the rest. Viewer-specific parts are client islands: BuyBox (member price, shipping estimator, stock refresh via SWR every 60 s), FitBadge, and the lazy Reviews and Q&A.

### 3.4 Cart and checkout shell

**\[Proposed\]** throughout, because the reference’s cart blocks automated access. The mini-cart is in §2.4.

**Cart page.** Two columns from lg: line items on the left, a sticky order summary on the right (360 px).

| Region | Spec |
| --- | --- |
| Line item | 80 px thumbnail, title link (2-line clamp), mono SKU, primary OEM number, fit chip, unit price (with member price when resolved), quantity stepper, line total, Remove, Save for later |
| Quantity | Stepper plus numeric input; 400 ms debounce; optimistic update with rollback; clamps to `maxQuantity` and explains why |
| Grouping | Lines grouped by fulfillment origin: “Ships from US warehouse” and “Ships from overseas”, each with a delivery window derived from `leadTimeDays` |
| Notices | Freight, split shipment, may-not-fit, price or stock changed. Each is a `role='status'` banner with an icon and a one-line action |
| Summary | Subtotal, member savings (green), points to earn, shipping (“Enter ZIP to estimate”), tax (“Calculated at checkout”), total once shipping is known; promo code in a collapsed row |
| Actions | Express pay row (Apple Pay, Google Pay, PayPal), then **Checkout** (disabled with a stated reason if a line is unavailable); trust note: 90-day returns, 1-year warranty, secure payment icons |

**Freight and shipping notices**

- **Freight shipment:** “Some items ship by freight. A delivery appointment and a liftgate may be required. The final freight cost is quoted at checkout.” Show it when any line has `shippingClass` of `freight` or `oversize`; the cart’s `shipping.status` becomes `quote_required`.
- **Split shipment:** show the grouped delivery windows above and say the order ships in more than one parcel.
- **May not fit:** inline amber text on the line, “May not fit your KX080-4. Check fit.” It is a soft warning and never blocks checkout.

**Behavior.** The cart lives on the server (`cartId` in an httpOnly cookie, merged into the account on sign-in). Mutations go through Server Actions or Route Handlers; the client cache is TanStack Query under `['cart']`. `Cart.version` is an optimistic-concurrency token: on a 409, refetch and show a toast. Removal shows an undo toast for 5 seconds. Empty cart: Select Model, top categories and recently viewed.

**Checkout shell.** Route `/checkout`. Steps: Contact, Shipping address, Delivery method, Payment, Review. Mobile is a single-column accordion; desktop is a form column plus a sticky summary. Guest checkout by default. A business toggle for PRO members collects company name and a tax-exemption upload. Address autocomplete; delivery options as radio cards showing price, ETA and origin; payment through your provider’s hosted elements (cards, PayPal, wallets); a collapsible order summary on mobile. Validate on blur, focus the first invalid field on submit, send an idempotency key with the order request, and keep layout shift at zero between steps. Analytics events: `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`.

## 4. Interactive UX Patterns & Complex State

### 4.1 Part Finder and the compatibility engine \[Proposed\]

**Observed entry points:** the header Select Model control and the Find Parts by Machine tiles on home. Brand pages also list popular models by machine type.

**Cascade:** Equipment type → Make → Model → optional Variant (engine or year). A free-text “Enter model number” combobox resolves a model directly, so typing PC200-8 skips the dropdowns.

**The saved machine (“garage”).** `MachineProfile[]`, up to 5, one active. Persist in a first-party cookie (ids only, under 1 KB) for signed-out users and sync to the account on sign-in. Read it on the client. Do not read cookies in the server components of cacheable pages: that opts the route out of static caching.

**No-dead-ends rules**

1. The server returns only options that have at least one product (`productCount > 0`), each with its count.
2. Steps unlock in order. Changing an upstream value revalidates the downstream values against the new option set: keep a downstream value if it is still valid, clear it if not.
3. If a step has exactly one option, select it automatically and show an Undo link.
4. A step with zero options after an upstream change shows an empty state, “We don’t list parts for this combination yet,” with a contact-a-specialist link and a part-number search field (the reference offers both fallbacks on every landing page).
5. Each step cancels its in-flight request on change (`AbortController`, or TanStack Query’s signal) and ignores out-of-order responses by `requestId`.
6. Prefetch the next level on hover and focus; prefetch the top 20 makes on idle. Cache options for 1 hour (`staleTime`).
7. Submitting navigates to `/machines/{make}/{model}` (a PLP pre-filtered to the machine) with a header strip, “Showing parts for Kubota KX080-4 · Change · Clear”, and stores the machine as active.

State model (reducer or XState):

```ts
type FinderStep = 'type' | 'make' | 'model' | 'variant';
type Selection = Partial<Record<FinderStep, string>>;
interface Option { value: string; label: string; productCount: number }

type FinderState =
  | { status: 'idle'; selection: Selection }
  | { status: 'loading'; step: FinderStep; selection: Selection; requestId: number }
  | { status: 'ready'; step: FinderStep; selection: Selection; options: Option[] }
  | { status: 'empty'; step: FinderStep; selection: Selection }
  | { status: 'error'; step: FinderStep; selection: Selection; retryable: boolean }
  | { status: 'complete'; selection: Selection & { type: string; make: string; model: string } };

type FinderEvent =
  | { type: 'SELECT'; step: FinderStep; value: string }
  | { type: 'CLEAR'; step: FinderStep } // clears this step and everything downstream
  | { type: 'OPTIONS_LOADED'; step: FinderStep; options: Option[]; requestId: number }
  | { type: 'OPTIONS_FAILED'; step: FinderStep; requestId: number }
  | { type: 'RESTORE'; selection: Selection } // from the saved machine
  | { type: 'SUBMIT' };
```

UI details: each dropdown is a searchable combobox (shadcn Popover plus Command); disabled steps say why (“Choose a make first”); completed steps show a clear (×) button; the Find Parts button enables as soon as Equipment type, Make and Model are set (the variant is optional); every step announces its result count politely (“42 models”).
