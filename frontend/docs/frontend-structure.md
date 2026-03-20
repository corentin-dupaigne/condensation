# Condensation — Frontend Structure Analysis
## Gaming Marketplace Competitive Audit & Page/Component Specification

---

## Marketplaces Analyzed

| Category | Platforms |
|---|---|
| **First-party storefronts** | Steam, Epic Games Store, GOG.com |
| **Key resellers (marketplace model)** | G2A, Kinguin, Eneba, Gamivo |
| **Key resellers (single-seller model)** | CDKeys, Instant Gaming, Green Man Gaming |
| **Price aggregators** | AllKeyShop, IsThereAnyDeal, GG.deals |

---

## PART 1 — Common Structural Patterns Across All Platforms

Every successful gaming marketplace shares a backbone of these structural elements. Deviating from this without good reason signals amateur hour to users who already have accounts on 5+ competing platforms.

### Global Shell (present on every page)

| Component | Notes |
|---|---|
| **Top banner bar** | Promotional/sale countdown (Kinguin, G2A, Epic all use this) |
| **Header / Navbar** | Logo, search bar, nav links, currency selector, language selector, auth buttons, cart icon with badge |
| **Mega menu / Category nav** | Platform filters (Steam, Xbox, PS5, Switch), genre filters, price range, product type (Games, DLC, Gift Cards, Subscriptions, Software) |
| **Search bar with autocomplete** | Instant results dropdown showing game thumbnails + price + platform badge |
| **Footer** | About, Legal (Terms, Privacy, Cookie), Support/FAQ, Partnership (Sell on platform, Affiliate, API), Social links, Newsletter signup, Trust badges (Trustpilot rating, payment icons) |
| **Cookie consent banner** | GDPR requirement — especially since you're likely targeting EU |
| **Toast/notification system** | Cart updates, price drop alerts, order confirmations |

---

## PART 2 — Pages & Components (Must-Have)

### Page 1: Homepage (`/`)

The homepage is a conversion funnel entrance. Every marketplace leads with high-margin, high-interest items.

**Sections (top to bottom):**

| Section | Component(s) | Reference |
|---|---|---|
| Hero area | `HeroCarousel` — Full-width rotating banners (3-5 slides) featuring featured/new/sale games. Each slide: background art, game logo, CTA button, price badge | Kinguin, Epic, Steam all use this |
| Secondary promo banner | `PromoBanner` — Thin clickable banner below hero (sale event, seasonal campaign) | Kinguin's "Spring Sale" top bar |
| Recommended for you | `GameCardGrid` — Horizontal scrollable row of personalized picks (requires auth + Steam sync per your design doc) | Steam "Recommendations" tab |
| Bestsellers | `GameCardGrid` — Ranked list with position numbers, horizontal scroll or grid | Kinguin, G2A, Eneba all have this |
| New releases | `GameCardGrid` with release date badges | Steam "New & Trending" |
| Pre-orders | `GameCardGrid` with countdown/release date | Kinguin dedicates a full tab to this |
| Deals / Under €X | `GameCardGrid` filtered by price threshold (Under €5, Under €10, Under €20) | Kinguin, CDKeys |
| Category quick-links | `CategoryPillRow` — Horizontal scrollable genre/platform chips | Kinguin footer area, Steam "Browse" |
| Trust section | `TrustBar` — Trustpilot widget, "X million customers", payment method icons, guarantee badge | G2A, Kinguin, CDKeys |
| Newsletter CTA | `NewsletterSignup` — Email input + consent checkbox | Every major marketplace |

**Components needed:**

- `HeroCarousel` (slides, dots, auto-advance, CTA overlay)
- `PromoBanner` (image, link, optional countdown timer)
- `GameCard` (thumbnail, title, platform badge, price, original price strikethrough, discount %, add-to-cart button, wishlist heart)
- `GameCardGrid` (title, "See all" link, horizontal scroll or wrap grid)
- `CategoryPill` (icon + label, link)
- `CategoryPillRow` (horizontal scroll container)
- `TrustBar` (static icons + rating widget)
- `CountdownTimer` (for sales/pre-orders)
- `NewsletterSignup` (input, button, consent checkbox)

---

### Page 2: Catalog / Browse Page (`/games`, `/games?platform=steam&genre=rpg`)

This is where users spend the most time. Steam and Kinguin both invest heavily in filter UX.

**Layout:** Sidebar filters (left) + Product grid (right) + Top sort bar

| Section | Component(s) |
|---|---|
| Filter sidebar | `FilterSidebar` containing: `FilterGroup` for Platform (Steam, Epic, Xbox, PS, Switch), Genre (Action, RPG, etc.), Price range slider, Product type (Game, DLC, Gift Card, Subscription), Region, Rating |
| Active filter tags | `ActiveFilterBar` — Removable chips showing current filters + "Clear all" |
| Sort bar | `SortDropdown` — Relevance, Price low-high, Price high-low, Bestselling, Newest, Discount % |
| View toggle | `ViewToggle` — Grid view vs List view |
| Results count | `ResultsCount` — "Showing 1-50 of 2,341 results" |
| Product grid | `GameCardGrid` using `GameCard` components |
| Pagination | `Pagination` — Page numbers + prev/next, or infinite scroll with "Load more" |
| Empty state | `EmptyState` — "No games found. Try adjusting your filters." |

**Components needed:**

- `FilterSidebar`
- `FilterGroup` (collapsible section with checkboxes or radio buttons)
- `PriceRangeSlider` (dual-thumb range input)
- `ActiveFilterBar` (removable chips)
- `SortDropdown`
- `ViewToggle`
- `Pagination` (or `InfiniteScrollLoader`)
- `EmptyState`

---

### Page 3: Product Detail Page (`/games/:slug`)

This is the money page. Every decision the user makes about purchasing happens here.

**Sections (top to bottom):**

| Section | Component(s) | Reference |
|---|---|---|
| Breadcrumb | `Breadcrumb` — Home > Games > RPG > Elden Ring | Standard e-commerce |
| Main product area | Two-column layout: Left = `MediaGallery`, Right = `ProductInfo` | Steam, Epic, all key resellers |
| Media gallery | `MediaGallery` — Main image/video + thumbnail strip. Support for screenshots, trailers (YouTube embed or video player), cover art | Steam uses trailer auto-play |
| Product info panel | `ProductInfoPanel` — Title, platform badge(s), edition selector (Standard/Deluxe/Ultimate), region selector, price (with original + discounted), add-to-cart button, buy-now button, wishlist button, availability status, instant delivery badge | G2A, Kinguin, Eneba |
| Edition/variant selector | `EditionSelector` — Tabs or dropdown for Standard, Deluxe, Ultimate, GOTY editions | Kinguin, Steam |
| Seller offers (if marketplace model) | `SellerOfferTable` — List of offers from different sellers with seller rating, price, add-to-cart per offer | G2A, Kinguin, Eneba, Gamivo |
| Price comparison (optional) | `PriceComparisonWidget` — Show your price vs Steam/Epic official price | CDKeys, IsThereAnyDeal |
| How it works | `HowItWorks` — 3-step visual: 1. Buy key → 2. Receive instantly → 3. Activate on platform | CDKeys, G2A |
| About this game | `GameDescription` — Rich text with GIFs/images, collapsible "Read more" | Steam "About This Game" |
| System requirements | `SystemRequirements` — Tabs for Minimum/Recommended, specs table | Steam |
| Reviews / Ratings | `ReviewSection` — Average score, review count, individual user reviews with helpful/not helpful voting | Steam, GOG |
| Related games | `GameCardGrid` — "You may also like" or "Customers also bought" | Every platform |
| Recently viewed | `GameCardGrid` — "Recently viewed" persistent across session | Steam |

**Components needed:**

- `Breadcrumb`
- `MediaGallery` (main display + thumbnails, video support)
- `ProductInfoPanel`
- `EditionSelector`
- `RegionSelector`
- `PlatformBadge` (Steam icon, Epic icon, etc.)
- `PriceDisplay` (original price, discounted price, discount badge)
- `SellerOfferRow` (seller name, seller rating stars, price, cart button)
- `SellerOfferTable`
- `HowItWorks` (3-step visual)
- `GameDescription` (rich text, expandable)
- `SystemRequirements` (tabbed table)
- `ReviewCard` (user avatar, rating, text, date, helpful votes)
- `ReviewSection` (aggregate score, filter by rating, list of `ReviewCard`)
- `AddToCartButton`
- `BuyNowButton`
- `WishlistButton`

---

### Page 4: Cart Page (`/cart`)

| Section | Component(s) |
|---|---|
| Cart item list | `CartItemRow` — Thumbnail, title, platform, edition, region, unit price, quantity selector (usually 1 for keys), remove button |
| Gift card / coupon input | `CouponInput` — Code input + Apply button, success/error feedback |
| Order summary | `OrderSummary` — Subtotal, discount, gift card credit, total. "Proceed to checkout" CTA |
| Buyer protection upsell | `BuyerProtection` — Optional protection add-on (G2A Shield model) — consider if relevant |
| Recommended add-ons | `GameCardGrid` — "Complete your order" cross-sell |
| Empty cart state | `EmptyCartState` — "Your cart is empty" + CTA to browse |

**Components needed:**

- `CartItemRow`
- `QuantitySelector`
- `CouponInput`
- `OrderSummary`
- `EmptyCartState`

---

### Page 5: Checkout Page (`/checkout`)

| Section | Component(s) |
|---|---|
| Order review | `OrderReviewList` — Compact list of items being purchased |
| Payment method selection | `PaymentMethodSelector` — Credit card form (Stripe), PayPal, crypto, gift card balance. Saved payment methods if returning user |
| Billing info | `BillingForm` — Name, email, country (for tax/region compliance) |
| Gift card redemption | `GiftCardInput` — Apply gift card balance |
| Order total | `OrderTotalBreakdown` — Subtotal, tax, payment fee, total |
| Place order CTA | `PlaceOrderButton` — With loading state, terms agreement checkbox |

**Components needed:**

- `OrderReviewList`
- `PaymentMethodSelector`
- `CreditCardForm` (or Stripe Elements embed)
- `BillingForm`
- `GiftCardInput`
- `OrderTotalBreakdown`
- `PlaceOrderButton`
- `TermsCheckbox`

---

### Page 6: Order Confirmation Page (`/order/:id/confirmation`)

| Section | Component(s) |
|---|---|
| Success message | `OrderSuccessBanner` — Checkmark icon, "Order confirmed!" |
| Key delivery | `KeyDeliveryCard` — The actual game key(s) with copy-to-clipboard button, platform activation link, activation instructions |
| Order details | `OrderDetailSummary` — Order ID, date, payment method, items, total |
| Activation guide | `ActivationGuide` — Step-by-step how to redeem on Steam/Epic/etc. with screenshots or icons |
| Support CTA | Link to support if key doesn't work |

**Components needed:**

- `OrderSuccessBanner`
- `KeyDeliveryCard` (key display, copy button, reveal/hide toggle)
- `OrderDetailSummary`
- `ActivationGuide` (per-platform instructions)

---

### Page 7: User Dashboard / Profile (`/account`)

| Sub-page | Route | Component(s) |
|---|---|---|
| Overview | `/account` | `DashboardOverview` — Welcome banner, recent orders, wallet balance, seniority badge |
| Order history | `/account/orders` | `OrderHistoryTable` — List of past orders with status, date, total, "View keys" link |
| Order detail | `/account/orders/:id` | `OrderDetail` — Full order breakdown, key re-delivery, support ticket link |
| Wishlist | `/account/wishlist` | `WishlistGrid` — Grid of wishlisted games with current price, price change indicator, add-to-cart, remove |
| Wallet / Gift cards | `/account/wallet` | `WalletBalance` — Current balance, transaction history, redeem gift card form |
| Profile settings | `/account/settings` | `ProfileForm` — Avatar upload, display name, email, password change |
| Steam connection | `/account/settings/steam` | `SteamConnectionCard` — Connect/disconnect Steam, show linked profile, sync status |
| Notifications | `/account/notifications` | `NotificationPreferences` — Toggle price drop alerts, newsletter, order updates |
| Sell keys (P2P) | `/account/sell` | `SellKeyForm` — Game search, platform, key input, price setting, listing management |
| My listings | `/account/listings` | `ListingsTable` — Active/sold/expired listings with edit/delete |

**Components needed:**

- `DashboardOverview`
- `SeniorityBadge` (per your design doc gamification feature)
- `OrderHistoryTable`
- `OrderDetail`
- `WishlistGrid`
- `WalletBalance`
- `TransactionHistory`
- `ProfileForm`
- `AvatarUpload`
- `SteamConnectionCard`
- `NotificationPreferences`
- `SellKeyForm`
- `ListingsTable`
- `ListingRow`

---

### Page 8: Authentication Pages

| Page | Route | Component(s) |
|---|---|---|
| Login | `/login` | `LoginForm` — Email/password, "Forgot password" link, OAuth buttons (Google, Facebook, Steam, Twitch — matching Kinguin's approach), "Sign up" link |
| Register | `/register` | `RegisterForm` — Email, password, confirm password, terms checkbox, OAuth quick-sign-up |
| Forgot password | `/forgot-password` | `ForgotPasswordForm` — Email input, submit, success message |
| Reset password | `/reset-password/:token` | `ResetPasswordForm` — New password, confirm, submit |
| Email verification | `/verify-email/:token` | `EmailVerification` — Auto-verify on load, success/error message |

**Components needed:**

- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `EmailVerification`
- `OAuthButtonGroup` (Google, Facebook, Steam, Twitch, PayPal)
- `PasswordStrengthIndicator`

---

### Page 9: Search Results Page (`/search?q=...`)

| Section | Component(s) |
|---|---|
| Search header | `SearchHeader` — Query display, result count |
| Quick filters | `QuickFilterBar` — Platform, price range, product type (same as catalog but contextual) |
| Results | `GameCardGrid` — Same card component as catalog |
| No results state | `NoResultsState` — "No results for X. Did you mean Y?" with suggestions |
| Popular searches | `PopularSearches` — Trending search terms (Steam added this recently) |
| Recently viewed | `RecentlyViewed` — Horizontal scroll of recently viewed items |

---

### Page 10: Static/Legal Pages

| Page | Route |
|---|---|
| About Us | `/about` |
| FAQ / Help Center | `/faq` |
| Terms of Service | `/terms` |
| Privacy Policy | `/privacy` |
| Cookie Policy | `/cookies` |
| Contact / Support | `/contact` |
| How It Works | `/how-it-works` |
| Seller/Affiliate Program | `/sell` or `/affiliate` |
| Refund Policy | `/refund-policy` |

---

## PART 3 — Shared / Reusable Component Library

These components appear across multiple pages and should be built once, well.

| Component | Used On |
|---|---|
| `GameCard` | Homepage, Catalog, Search, Wishlist, Related Games |
| `GameCardGrid` | Homepage, Catalog, Search, Product Detail, Cart |
| `PlatformBadge` | GameCard, ProductDetail, Cart, Orders |
| `PriceDisplay` | GameCard, ProductDetail, Cart, Wishlist |
| `StarRating` | ProductDetail, SellerOfferRow, ReviewCard |
| `Modal` | Login prompt, confirm dialogs, key reveal |
| `Drawer` | Mobile navigation, mobile filters |
| `Tooltip` | Info icons, truncated text |
| `Skeleton` | Loading states for every card/list |
| `Badge` | Discount %, "New", "Pre-order", "Bestseller", "Instant Delivery" |
| `Avatar` | User profile, reviews, seller info |
| `Tabs` | Edition selector, system requirements, account sub-nav |
| `Accordion` | FAQ, filter groups, mobile navigation |
| `Alert` | Success/error/warning/info messages |
| `ConfirmDialog` | Delete listing, remove from cart, cancel order |
| `CopyToClipboard` | Key delivery |
| `CurrencySelector` | Header (Kinguin supports 40+ currencies) |
| `LanguageSelector` | Header |
| `ThemeToggle` | Light/dark mode (Kinguin has this) |

---

## PART 4 — What Your Design Doc Already Covers vs What's Missing

### Already in your design doc:
- OAuth2 with PKCE (authentication)
- Steam profile sync for recommendations
- Gift card integration
- Seniority badges (gamification)
- Price drop notifications via Kafka
- P2P key resale
- Microservice architecture (Marketplace, Catalog services)

### Missing from your design doc that competitors have:
- **Buyer protection program** (G2A Shield, Kinguin Buyer Protection) — This is table-stakes for a key resale marketplace. Without it, trust is zero.
- **Seller rating system** — If you allow P2P sales, you need seller profiles, ratings, and transaction history. G2A and Kinguin both have this.
- **Region lock handling** — Every key reseller prominently displays region restrictions. Your product detail page needs this front and center.
- **Activation guide system** — Step-by-step instructions per platform. CDKeys and Kinguin both have this. Reduces support tickets dramatically.
- **Price comparison / price history** — GG.deals and IsThereAnyDeal built entire businesses on this. Even a simple "Save X% vs Steam" label adds perceived value.
- **Mobile responsiveness strategy** — Kinguin and G2A get significant mobile traffic. Your Next.js app needs a mobile-first approach documented.
- **SEO pages** — Category landing pages (`/steam-games`, `/rpg-games`) with unique content. Kinguin has dozens of these. They drive organic traffic.

---

## PART 5 — Recommended Priority Order for Frontend Development

Based on your sprint planning and what creates a viable MVP:

| Priority | Pages | Rationale |
|---|---|---|
| **P0 — Ship-blocking** | Homepage, Catalog/Browse, Product Detail, Cart, Checkout, Order Confirmation, Auth pages (Login/Register) | Can't sell anything without these |
| **P1 — First week post-launch** | Search Results, User Dashboard (Orders, Wishlist), Account Settings | Users need to find games and manage accounts |
| **P2 — Growth features** | P2P Sell page, Listings management, Seller profiles, Wallet | Enables the marketplace flywheel |
| **P3 — Retention & trust** | Review system, Buyer protection, Price history, Seniority badges, Steam sync recommendations | Differentiators that keep users coming back |
| **P4 — SEO & scale** | SEO landing pages, Blog/News, Affiliate program pages | Organic acquisition channel |