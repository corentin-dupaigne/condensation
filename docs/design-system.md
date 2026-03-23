# Design System — Condensation

> Gaming marketplace for digital game keys. Stack: Next.js + Tailwind CSS. Style: Dark OLED + Glassmorphism.

---

## 1. Product Identity

| Attribute | Value |
|---|---|
| Product Type | Gaming Marketplace + E-commerce (hybrid) |
| Target Audience | Gamers buying/reselling Steam keys; Steam-connected users |
| Style Archetype | Dark OLED + Content-Dense + Immersive |
| Landing Pattern | Feature-Rich Showcase + Social Proof |
| CTA Strategy | Prominent purchase CTA per card; newsletter capture at bottom |

---

## 2. Color Tokens

All tokens are defined in [`frontend/app/globals.css`](../frontend/app/globals.css) as CSS custom properties and mapped to Tailwind via `@theme inline`.

### Current Token Map

| CSS Variable | Value | Role |
|---|---|---|
| `--background` | `#0c0e11` | Page background |
| `--foreground` | `#f9f9fd` | Default text |
| `--primary` | `#a1faff` | Brand color / interactive highlight |
| `--primary-container` | `#00f4fe` | Gradient end for CTAs |
| `--primary-dim` | `#00e5ee` | Hover state for primary |
| `--on-primary` | `#00393b` | Text on primary surfaces |
| `--secondary` | `#d575ff` | Accent / badges |
| `--secondary-container` | `#9800d0` | Badge backgrounds |
| `--tertiary` | `#f3ffca` | Lime accent (rare use) |
| `--tertiary-container` | `#cafd00` | Lime backgrounds |
| `--error` | `#ff716c` | Error states |
| `--surface` | `#0c0e11` | Base surface |
| `--surface-container` | `#171a1d` | Card backgrounds (low) |
| `--surface-container-high` | `#1d2024` | Card backgrounds (default) |
| `--surface-container-highest` | `#23262a` | Elevated elements |
| `--surface-bright` | `#292c31` | Hover surface |
| `--on-surface` | `#f9f9fd` | Primary text |
| `--on-surface-variant` | `#aaabaf` | Secondary text / icons |
| `--outline` | `#747579` | Borders |
| `--outline-variant` | `#46484b` | Subtle dividers |

### Design System Recommendation

For a gaming marketplace, the recommended palette is **Purple/Violet primary + Rose accent**. The current cyan primary (`#a1faff`) reads as SaaS/tech — consider this migration path:

| Token | Current | Recommended |
|---|---|---|
| `--primary` | `#a1faff` (cyan) | `#A78BFA` (violet) |
| `--primary-container` | `#00f4fe` | `#7C3AED` |
| `--secondary` | `#d575ff` | `#d575ff` (keep) |
| `--cta` | *(missing)* | `#F43F5E` (rose, for buy buttons) |

> **Decision**: Keeping cyan is acceptable if it's an intentional brand choice. If changing, update `globals.css` token values only — all components use tokens, not hardcoded hex.

---

## 3. Typography

### Font Pairing

| Role | Font | CSS Variable | Weight |
|---|---|---|---|
| Headlines / Prices | Space Grotesk | `--font-headline` | 300–700 |
| Body text | Inter | `--font-body` | 400, 500 |

### Type Scale

| Step | Size | Usage | Class |
|---|---|---|---|
| Display | 48–60px | Hero h1 | `text-5xl` / `text-6xl` |
| Headline | 24–32px | Section titles | `text-2xl` |
| Title | 18–20px | Card titles | `text-base` / `text-lg` |
| Body | 14–16px | Descriptions | `text-sm` |
| Label | 12px | Tags, badges | `text-xs` |
| Caption | ~~10px~~ → 12px | Genre tags | ~~`text-[10px]`~~ → `text-xs` |

> **Rule**: Minimum readable text is 12px. The genre tags in `GameCard` use `text-[10px]` which violates this — change to `text-xs`.

### Font Loading

Use `next/font` for proper font loading (no FOIT, no CLS):

```tsx
// app/layout.tsx
import { Space_Grotesk, Inter } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-headline' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
```

> **Current issue**: `globals.css` has an invalid `@font-face` with a Google Fonts URL as `src` — this doesn't work. Use `next/font` or `@import` at top of CSS instead.

---

## 4. Spacing System

Based on 4px base unit (Tailwind's default):

| Token | Value | Usage |
|---|---|---|
| xs | 4px (`p-1`) | Icon padding, tight gaps |
| sm | 8px (`p-2`) | Inline element gaps |
| md | 12–16px (`p-3`/`p-4`) | Card padding |
| lg | 24px (`p-6`) | Section horizontal gutter |
| xl | 32px (`py-8`) | Section vertical rhythm |
| 2xl | 40px (`py-10`) | Section vertical rhythm (alt) |

Container: `max-w-7xl mx-auto px-6` — consistent across all sections. ✅

---

## 5. Component Patterns

### Navigation Header
- Sticky, `z-50`, glassmorphic (`backdrop-blur-xl bg-surface-container/70`)
- Logo → Nav links → Search → Auth CTAs → Cart
- Search has focus ring on focus: `ring-1 ring-primary/40` ✅
- `aria-label` on cart button ✅

### Game Card (`GameCard`)
- Fixed width `w-[200px]`, `aspect-[3/4]` cover image
- Hover: `hover:bg-surface-bright` surface elevation ✅
- `aria-label` on add-to-cart button ✅
- **Issue**: Cart button is `h-7 w-7` (28px) — must be ≥44px touch target
- **Issue**: Title uses `truncate` — add `title={game.title}` for tooltip

### Bestsellers Row (`BestsellersSection`)
- Full-width list with rank number + thumbnail + title + price
- Hover elevation: `hover:bg-surface-bright` ✅
- **Issue**: Uses `let counter = 1` mutable variable — use map `index + 1` instead

### Hero Carousel (`HeroCarousel`)
- Full-bleed `h-[60vh]` gradient section
- Auto-advances every 6s
- Dot navigation with `aria-label` ✅
- **Issue**: No `prefers-reduced-motion` handling — interval should be disabled when motion is reduced
- **Issue**: No pause-on-hover mechanism

### Section Pattern (all home sections)
- Consistent: `h2` section title + optional "View All" link
- `max-w-7xl px-6 py-8/py-10` container ✅

---

## 6. Effects & Style

### Glassmorphism (nav, overlays)
```css
.glass-panel {
  background: rgba(29, 32, 36, 0.7);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(170, 171, 175, 0.15);
  border-left: 1px solid rgba(170, 171, 175, 0.15);
}
```
Use only for: navbar, modal overlays, floating panels. Not for cards. ✅

### CTA Gradient
```css
bg-gradient-to-br from-primary to-primary-container
```
Used for: Sign Up button, Buy Now button, hero CTA. Consistent ✅

### Border Radius Scale
| Component | Class | Radius |
|---|---|---|
| Cards | `rounded-lg` | 8px |
| Buttons | `rounded-lg` / `rounded-xl` | 8–12px |
| Hero image | `rounded-2xl` | 16px |
| Badge | `rounded` / `rounded-full` | 4px / full |

### Custom Scrollbar
Applied via `.custom-scrollbar` — thin, dark thumb, primary-dim hover. Use on all horizontal scroll containers. ✅

### Animations
| Name | Duration | Usage |
|---|---|---|
| Slide indicator | `transition-all` | Carousel dot width change |
| Hero gradient | `transition-colors duration-700` | Background color shift — wrap in `prefers-reduced-motion` |
| Surface hover | `transition-colors` (150ms) | Cards, nav items ✅ |

---

## 7. Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| Base | 0 | Normal content |
| Cards floating | 10 | Badges on game cards |
| Sticky header | 50 | `z-50` ✅ |
| Modals | 100 | (future) |
| Toasts | 1000 | (future) |

---

## 8. Accessibility Rules

| Rule | Status | Notes |
|---|---|---|
| Alt text on images | ✅ | Present on all `<img>` tags |
| `aria-label` on icon buttons | ✅ | Cart button, carousel dots |
| Focus ring on search input | ✅ | `ring-1 ring-primary/40` on focus |
| Semantic heading hierarchy | ✅ | `h1` in hero, `h2` for sections, `h3` for cards |
| Minimum text size 12px | ❌ | Genre tags use `text-[10px]` |
| Touch target ≥44px | ❌ | Cart button is 28×28px |
| `prefers-reduced-motion` | ❌ | HeroCarousel interval not paused |
| Skip-to-content link | ❌ | Not implemented yet |
| Keyboard nav on carousel | ⚠️ | Dots are keyboard-focusable but no keyboard left/right |

---

## 9. Gap Analysis — Current vs Recommended

### CRITICAL (Fix First)

| # | Issue | File | Line | Fix |
|---|---|---|---|---|
| 1 | Cart button 28px < 44px minimum | `GameCard.tsx` | 69 | Change `h-7 w-7` → `h-11 w-11` or add `p-3` wrapper |
| 2 | Genre tags at `text-[10px]` | `GameCard.tsx` | 50 | Change to `text-xs` (12px) |
| 3 | HeroCarousel: no `prefers-reduced-motion` | `HeroCarousel.tsx` | 14 | Check `matchMedia` and skip interval |

### HIGH

| # | Issue | File | Line | Fix |
|---|---|---|---|---|
| 4 | `@font-face` src is invalid Google Fonts URL | `globals.css` | 3 | Replace with `next/font` or `@import` |
| 5 | `<img>` without `width`/`height` → CLS risk | Multiple | — | Use Next.js `<Image>` or add explicit dimensions |
| 6 | Title truncates without tooltip | `GameCard.tsx` | 43 | Add `title={game.title}` attribute |

### MEDIUM

| # | Issue | File | Line | Fix |
|---|---|---|---|---|
| 7 | `let counter = 1` mutated in `.map()` | `BestsellersSection.tsx` | 6 | Use `(game, index) => index + 1` |
| 8 | Horizontal card scroll has no scroll-snap | `GameCardGrid.tsx` | 31 | Add `scroll-snap-type-x mandatory` + `snap-start` on cards |
| 9 | No skeleton loading states | All sections | — | Add shimmer placeholders for SSR delay |

### Matches Well ✅

- Dark OLED base theme — correct for gaming marketplace
- Semantic CSS custom property token system (Material-style naming)
- SVG icons used throughout — no emojis
- `aria-label` on interactive icon elements
- `glass-panel` glassmorphism used only on nav (correct purpose)
- Consistent `max-w-7xl px-6` container across all sections
- `font-display: swap` approach for font loading
- Space Grotesk + Inter pairing — clean, modern, gaming-appropriate
- Section heading pattern consistent across home sections
- Gradient CTA buttons consistent across hero and card

---

## 10. Pre-Delivery Checklist

Before shipping any UI feature:

### Accessibility
- [ ] All `<img>` have descriptive `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] Text minimum 12px (`text-xs`) — no `text-[10px]`
- [ ] Touch targets ≥44px (buttons, links)
- [ ] Focus states visible (don't remove `outline`)
- [ ] `prefers-reduced-motion` checked for animations

### Style
- [ ] Colors use CSS tokens — no raw hex in components
- [ ] Icons are SVG (Heroicons inline) — no emojis
- [ ] Hover states use `transition-colors` (150–300ms)
- [ ] Glassmorphism only on nav/overlays — not on data cards

### Layout
- [ ] Container uses `max-w-7xl mx-auto px-6`
- [ ] Sections use `py-8` or `py-10` vertical rhythm
- [ ] Horizontal scroll containers include `.custom-scrollbar`
- [ ] Mobile layout tested at 375px width

### Performance
- [ ] Images use `loading="lazy"` for below-fold content
- [ ] Images have explicit `width` and `height` (or use Next.js `<Image>`)
- [ ] No raw `<img>` for static assets — prefer `<Image>` from `next/image`
