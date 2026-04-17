# Design System Strategy: The Kinetic Fluidity

> Gaming marketplace for digital game keys. Stack: Next.js + Tailwind CSS. Creative North Star: **The Digital Pulse**.

---

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Digital Pulse."**

In a gaming marketplace, speed and energy are paramount, but they must be anchored by a sense of unwavering security. We move away from the "static grid" of traditional e-commerce. Instead, we treat the UI as a high-performance engine: fluid, reactive, and layered. We break the template look through **Intentional Asymmetry** — using oversized display type justified against compact data modules — and **Tonal Depth**, where the interface feels like a series of illuminated glass panels floating in a deep, pressurized void.

| Attribute | Value |
|---|---|
| Product Type | Gaming Marketplace + E-commerce (hybrid) |
| Target Audience | Gamers buying/reselling Steam keys; Steam-connected users |
| Style Archetype | Neon Void + Glassmorphism + Editorial Scale |
| Landing Pattern | Asymmetric Hero + Tonal-Depth Panels + Live-Pulse Proof |
| CTA Strategy | Gradient primary CTA; secondary ghost style; tertiary utility |

---

## 2. Colors: The Neon Void

Our palette thrives on the contrast between the absolute stability of deep charcoals and the volatile energy of "electric" accents. All tokens are defined in [`frontend/app/globals.css`](../frontend/app/globals.css) and mapped to Tailwind via `@theme inline`.

### Accent Roles

| Token | Value | Role |
|---|---|---|
| `--primary` | `#a1faff` (Cyan) | High-action triggers, "coolant" — fast and precise |
| `--primary-container` | `#00f4fe` | Gradient end for CTAs |
| `--secondary` | `#d575ff` (Neon Purple) | "Energy source" — discovery, rare items, premium tiering |
| `--secondary-container` | `#9800d0` | Badge backgrounds (Legendary/Epic) |
| `--tertiary` | `#f3ffca` (Lime) | Success states, "In Stock", price drops, live pulse |
| `--tertiary-container` | `#cafd00` | Lime accents |
| `--error` | `#ff716c` | Error states, destructive feedback |

### Surface Hierarchy & Nesting

Treat the UI as a physical stack. Depth comes from tier transitions, **not** borders.

| Tier | Token | Value | Usage |
|---|---|---|---|
| Base | `--surface` | `#0c0e11` | Page background (the void) |
| Sectional | `--surface-container-low` | `#111417` | Sidebars, navigation rails, groupings |
| Component | `--surface-container` | `#171a1d` | Secondary components |
| Component (high) | `--surface-container-high` | `#1d2024` | Cards, input areas |
| Component (highest) | `--surface-container-highest` | `#23262a` | Elevated inputs, tertiary buttons |
| Active / Floating | `--surface-bright` | `#292c31` | Modals, hover states |

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional borders clutter the gamer-centric aesthetic. Boundaries must be defined solely by background shifts — transition from `surface` to `surface-container-low` to separate a sidebar from a main feed.

### The "Glass & Gradient" Rule

- **CTA gradient**: linear gradient from `primary` → `primary-container` at **135deg**. Applied to primary buttons and key hero CTAs.
- **Glassmorphism**: `surface-container` at 70% opacity + `backdrop-blur(12px)` + a 1px **inner highlight** (top + left edges only) using `on-surface-variant` at 15%. Use for navbar, floating overlays, "Quick Buy" panels.
- Never use pure black (`#000000`) except for the deepest shadows.

---

## 3. Typography: Editorial Impact

A high-contrast pairing that balances technical precision with aggressive energy.

| Role | Font | CSS Variable | Weight | Notes |
|---|---|---|---|---|
| Display / Headline | Space Grotesk | `--font-headline` | 300–700 | "Mechanical" voice |
| Body / Label | Inter | `--font-body` | 400, 500 | "Functional" voice |

### Type Scale

| Step | Size | Tailwind | Usage |
|---|---|---|---|
| Display LG | 3.5rem (56px) | `text-6xl` + `tracking-tight` (-0.02em) | Hero headlines — oversized, editorial |
| Display SM | 2.25rem (36px) | `text-4xl` | Section displays paired with label-md sub-headers |
| Headline | 1.5rem (24px) | `text-2xl` | Section titles |
| Title | 1.125rem (18px) | `text-lg` | Card titles |
| Body MD | 0.875rem (14px) | `text-sm` | Descriptions, compact body |
| Body | 1rem (16px) | `text-base` | Default body |
| Label MD | 0.75rem (12px) | `text-xs uppercase tracking-wider` | Sub-headers, tags |

> **Rule**: Minimum readable size is 12px. Never use `text-[10px]`. Always pair a `display-sm` headline with a `label-md` uppercase sub-header to create an authoritative, structured-data look.

### Font Loading

Load via `next/font` (no FOIT, no CLS). Do not rely on `@font-face` pointing at a Google Fonts CSS URL.

---

## 4. Elevation & Depth

Elevation is a product of **light and transparency**, not drop shadows.

- **Layering Principle**: Depth via stacking tiers. A `surface-container-highest` card on a `surface-container-low` background provides "lift" without visual noise.
- **Ambient Glow**: Floating-state shadow uses a **40px blur, 10% opacity, `primary` (#a1faff)** color — mimicking the glow of a high-end PC setup, never pure black.
- **Ghost Border Fallback**: If accessibility mandates a stroke, use `outline-variant` (#46484b) at **20% opacity**. Never 100% opaque lines.
- **Glass Inner Highlight**: 1px inner highlight on **top + left edges** using `on-surface-variant` at 15%, "cutting" glass elements out of the dark background.

---

## 5. Components

### Buttons

| Variant | Style | Usage |
|---|---|---|
| **Primary** | Gradient (`primary` → `primary-container` at 135°), `on-primary-fixed` text, `rounded-xl` (12px), `font-bold` | Buy Now, Sign Up, hero CTA |
| **Secondary** | Ghost — no background, `outline` at 20%, text in `secondary` | Alternative actions |
| **Tertiary** | `surface-container-highest` bg, `on-surface` text | Utility (Add to Wishlist, filter toggle) |

### Cards & Lists

- **Absolute prohibition of divider lines.**
- **Separation**: Use 2rem (`space-y-8`) of vertical whitespace, or alternate backgrounds (`surface-container-low` ↔ `surface-container-lowest`).
- **Product Cards**: `surface-container-high` + `rounded-xl`. Hover → `surface-bright`.

### Input Fields

- **Base**: `surface-container-highest` background, **no border**.
- **Active**: 1px Ghost Border using `primary` at 40% opacity + subtle cyan glow.
- **Error**: Dark background preserved; a bottom 2px glow line in `error` appears.

### Gaming-Specific

- **Rarity Badges**: `secondary-container` background with `on-secondary-container` text — for "Legendary" or "Epic" tiers.
- **Live Pulse**: 8px circle using `tertiary` with CSS ripple animation — indicates live sellers, active auctions, "In Stock".

### Navigation (Glassmorphic)

- Sticky, `z-50`.
- `backdrop-blur-xl` + `surface-container/70` + 1px inner highlight (top/left, 15% opacity).
- **No border-bottom**. Separation from page content is the tonal contrast alone.

---

## 6. Do's and Don'ts

### Do
- Use extreme scale. Pair a 56px headline with 12px uppercase label text for a sophisticated "pro" look.
- Use asymmetrical margins. Offset hero images to break container edges — creates kinetic energy.
- Prioritize "Breathable Dark Space". Let `#0c0e11` dominate so neon accents pop.
- Use `tertiary` (lime) exclusively for success and price-drop signals.

### Don't
- **Don't** use pure black (`#000000`) for anything other than the deepest shadows.
- **Don't** use standard 1px solid borders. If you need a line, use a background-color shift.
- **Don't** use more than two accent colors in a single component. Stick to Cyan for actions, Purple for status/flair.
- **Don't** use flat color buttons for primary CTAs — always gradient.

---

## 7. Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| Base | 0 | Normal content |
| Floating badges | 10 | Badges on cards |
| Sticky header | 50 | Glassmorphic nav |
| Modals | 100 | Overlays |
| Toasts | 1000 | Transient feedback |

---

## 8. Accessibility Rules

| Rule | Target |
|---|---|
| Color contrast | 4.5:1 body, 3:1 large text |
| Minimum text size | 12px — never `text-[10px]` |
| Touch target | ≥44px (h-11 w-11) on buttons/icons |
| Icon-only buttons | Require `aria-label` |
| Focus ring | `ring-1 ring-primary/40` — never remove outline |
| `prefers-reduced-motion` | Honor in all interval-based animations (carousels, live-pulse) |
| Semantic headings | `h1` hero → `h2` section → `h3` card |
| Keyboard navigation | Carousel dots and nav items keyboard-reachable |

---

## 9. Effects & Utilities

### Glassmorphism (`.glass-panel`)
```css
background: rgba(23, 26, 29, 0.7);
backdrop-filter: blur(12px);
/* Inner highlight — top + left only */
box-shadow:
  inset 1px 0 0 rgba(170, 171, 175, 0.15),
  inset 0 1px 0 rgba(170, 171, 175, 0.15);
```
Use only for nav, modal overlays, Quick Buy panels. Never for data cards.

### CTA Gradient (`.cta-gradient`)
```css
background: linear-gradient(135deg, var(--primary), var(--primary-container));
```

### Ambient Glow (floating state)
```css
box-shadow: 0 0 40px rgba(161, 250, 255, 0.10);
```

### Live Pulse (`.live-pulse`)
8px `tertiary` circle with a CSS ripple `::after` at 2.5× scale, fading to 0. Respects `prefers-reduced-motion`.

### Border Radius Scale
| Component | Class | Radius |
|---|---|---|
| Cards, Inputs | `rounded-xl` | 12px |
| Primary Button | `rounded-xl` | 12px |
| Hero image | `rounded-2xl` | 16px |
| Badge | `rounded-full` / `rounded` | full / 4px |

### Custom Scrollbar (`.custom-scrollbar`)
Thin, dark thumb, `primary-dim` on hover. Applied to every horizontal scroll container.

---

## 10. Pre-Delivery Checklist

Before shipping any UI feature:

### Accessibility
- [ ] All `<img>` have descriptive `alt` text
- [ ] Icon-only buttons have `aria-label`
- [ ] Text minimum 12px (`text-xs`) — no `text-[10px]`
- [ ] Touch targets ≥44px (h-11 w-11)
- [ ] Focus states visible (`ring-1 ring-primary/40`)
- [ ] `prefers-reduced-motion` respected in carousels/pulses

### Style
- [ ] Colors reference CSS tokens — no raw hex in components
- [ ] Icons are SVG (Heroicons, Lucide) — no emojis
- [ ] Primary CTA uses `cta-gradient` — never flat color
- [ ] Glassmorphism only on nav/overlays — never on data cards
- [ ] No solid 1px borders — separation via tonal shift

### Layout
- [ ] Container uses `max-w-7xl mx-auto px-6`
- [ ] Sections use `py-8`–`py-10` vertical rhythm
- [ ] Horizontal scroll containers include `.custom-scrollbar`
- [ ] Mobile layout tested at 375px width

### Performance
- [ ] Images use `loading="lazy"` for below-fold content
- [ ] Images have explicit `width`/`height` or use `next/image`
- [ ] Fonts via `next/font` (no `@font-face` at Google Fonts URL)
