# Rapport — Suite de tests e2e Condensation

## Stack

| Élément | Valeur |
|---|---|
| Framework | Microsoft.Playwright 1.58.0 |
| Runner | NUnit 4.5.1 + Microsoft.Playwright.NUnit |
| Langage | C# / .NET 10 |
| Navigateur | Chromium headless, 1920 × 1080 |
| Config runtime | `E2E_BASE_URL` (défaut `http://localhost:4000`), `E2E_TIMEOUT` ms (défaut `15000`), `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` |
| Config fichier | `.runsettings` — `ExpectTimeout=5000`, `NUnit.DefaultTimeout=20000`, `Headless=true` |

Résultat de la dernière exécution complète : **163 réussis · 0 échec · 1 conditionnellement ignoré · 40 min 43 s**.

---

## Architecture — Page Object Model

```
e2e-tests/
├── Config/TestSettings.cs              # BaseUrl, Timeout, credentials via env
├── Pages/
│   ├── BasePage.cs                     # PagePath abstrait, NavigateAsync, Header, Footer
│   ├── Components/
│   │   ├── HeaderComponent.cs          # Logo, nav, recherche, cart badge, auth links
│   │   └── FooterComponent.cs          # Sélecteur excluant l'overlay dev Next.js
│   ├── HomePage.cs · CatalogPage.cs · ProductPage.cs · CartPage.cs
│   ├── SearchPage.cs · LoginPage.cs · RegisterPage.cs
└── Tests/
    ├── BaseTest.cs                     # PageTest + LoginAsync, LogoutAsync, GoToAsync
    ├── AuthenticatedBaseTest.cs        # BaseTest + SetUp qui fait LoginAsync
    └── <une fixture par feature>.cs
```

### Layering

```
PageTest (Microsoft.Playwright.NUnit)
  └── BaseTest
        ├── ContextOptions  → viewport 1920×1080, BaseURL, IgnoreHTTPSErrors
        ├── BaseSetUp       → SetDefaultTimeout / SetDefaultNavigationTimeout
        ├── GoToAsync(url)  → GotoAsync(DOMContentLoaded) + best-effort Load 5s
        ├── LoginAsync()    → OAuth/PKCE complet, attend userMenu visible
        └── LogoutAsync()   → ouvre menu, clique Logout, attend Sign In visible
              │
              └── AuthenticatedBaseTest ─ [SetUp] LoginAsync()
```

```
BasePage (abstraite)
  ├── PagePath                 (override par sous-classe)
  ├── NavigateAsync            GotoAsync(DOMContentLoaded) + Load best-effort 5s
  └── Header, Footer           composants partagés

CartPage, CatalogPage, …
  ├── ILocator publics         exposés pour usage avec Expect() dans les tests
  └── Méthodes d'action        ClickAddToCartAsync, GetCartItemCountAsync, …
```

---

## Méthodologie

### Hiérarchie de sélecteurs

| Priorité | Type | Exemple |
|---|---|---|
| 1 | ARIA (`aria-label`, `aria-current`, `role`) | `button[aria-label='Next slide']` |
| 2 | Sémantique HTML (`type`, `name`, `id`) | `#email`, `input[type='checkbox']` |
| 3 | Structure DOM + texte | `section form button:has-text('Search')` |
| 4 | Attribut fonctionnel (`href`) | `a[href='/games']` |
| évité | Classes CSS / Tailwind | fragile en cas de refacto de style |

Le HeroCarousel et le menu utilisateur sont intégralement testés via ARIA.

### Attentes (auto-wait plutôt que sleep)

- **`Expect(locator).ToBeVisibleAsync()` / `ToHaveTextAsync` / `ToHaveAttributeAsync`** — le polling est géré par Playwright (5 s), plus fiable qu'un `WaitForTimeoutAsync` fixe.
- **`WaitForURLAsync(predicate, { WaitUntil = DOMContentLoaded })`** — Next.js dev ne déclenche pas toujours `load` à cause des WebSockets HMR, d'où le choix de `DOMContentLoaded`.
- **Aucun `WaitForTimeoutAsync(N)`** dans les tests : tous remplacés par des waits événementiels.

### Timeouts (réduits au minimum utile)

| Scope | Valeur | Justification |
|---|---|---|
| `Page.SetDefaultTimeout` / `SetDefaultNavigationTimeout` | 15 000 ms | OAuth chain (form → redirect → callback) + compilation Next.js dev |
| `ExpectTimeout` (runsettings) | 5 000 ms | Assertions UI après action stable |
| `WaitForLoadStateAsync(Load)` best-effort | 5 000 ms | Donne à React le temps d'hydrater ; `catch (TimeoutException)` pour ne pas bloquer |
| `NUnit.DefaultTimeout` | 20 000 ms | Filet de sécurité par test |

### Isolation

- Chaque test reçoit un `IBrowserContext` frais (`PageTest`) ; cookies, localStorage et store Zustand repartent à zéro.
- Les fixtures auth-only redéclenchent le flow OAuth complet dans `[SetUp]` — lent mais sans couplage.

### Tests conditionnels

`Assert.Inconclusive` est utilisé quand la donnée de backend ne garantit pas la précondition (ex. `SearchPage_ResultCard_Click_ShouldNavigateToProductPage` nécessite ≥ 1 résultat pour « counter-strike »). Évite les faux négatifs en CI.

---

## Couverture par fixture

| Fixture | Tests | Auth | Portée |
|---|---:|:---:|---|
| `AuthTests` | 16 | — | Flow OAuth complet, liens Sign In/Up, user menu, persistance de session, logout |
| `LoginTests` | 8 | — | Visibilité et href des liens Sign In sur home/catalog/cart/search |
| `RegisterTests` | 5 | — | Accès au form de register via Sign Up, présence des champs |
| `NavigationTests` | 11 | — | Header : logo, cart, nav Browse/Store, recherche + preview dropdown, Escape |
| `HomeTests` | 13 | — | Sections (Recommended, Bestsellers, New Releases, Pre-Orders), trust bar, premier game card |
| `HeroCarouselTests` | 10 | — | ARIA carousel, flèches, 5 dots, activation dot, CTA BUY NOW |
| `CatalogTests` | 13 | — | Game cards (≥ 4, liens `/games/\d+`), filter sidebar, checkboxes genre, sort dropdown |
| `ProductTests` | 14 | — | Titre, breadcrumbs, Buy Now / Add to Cart / Wishlist, feedback « Added! », badge header, éditions, miniatures |
| `SearchTests` | 10 | — | Hero form submit, popular searches, result click, URL direct `?q=`, no-results |
| `CartTests` | 15 | — | Empty state + flow UI complet : add, +1 qty, remove, clear |
| `CheckoutTests` | 8 | ✅ | Modal de paiement : Balance, Stripe, total, Cancel |
| `OrderTests` | 6 | ✅ | Heading, accès depuis user menu, empty OR populated |
| `ProfileTests` | 14 | ✅ | Header profil, stats, tabs (Overview/Badges/Order History), section Steam |
| `SettingsTests` | 21 | ✅ | Account, Wallet (incl. modal Top Up + validation min 1 $), Linked Accounts, Notifications, Privacy |
| **TOTAL** | **164** | | 1 test parfois ignoré si backend sans résultats → **163 effectivement exécutés** |

### Répartition fonctionnelle

```
Authentification & session ........ 29 tests   (Auth + Login + Register)
Navigation & header ............... 11 tests   (NavigationTests)
Home & carrousel .................. 23 tests   (Home + HeroCarousel)
Catalogue ......................... 13 tests   (CatalogTests)
Page produit ...................... 14 tests   (ProductTests)
Recherche ......................... 10 tests   (SearchTests)
Panier & checkout ................. 23 tests   (Cart + Checkout)
Espace utilisateur ................ 41 tests   (Profile + Orders + Settings)
```

---

## Couverture — ce qui n'est pas testé

**Parcours d'achat bout-en-bout** — paiement réel (Stripe, Balance), création d'une order en base + apparition dans `/orders`, décrément du solde.

**Authentification** — inscription réelle, reset password, OAuth secondaires (Google/Steam/Xbox/PlayStation/Discord), erreurs d'auth (mauvais mot de passe, compte verrouillé).

**Catalogue** — pagination, filtres multi-critères combinés, filtre Platform, « Clear All Filters » après sélection, vue grille vs liste, tri reflété sur l'ordre des cartes.

**Produit** — Wishlist persistant, Buy Now direct, bascule édition Standard/Deluxe change le prix, related games, lecteur vidéo.

**Panier** — `Decrease quantity`, persistance après reload/re-login, recalcul du total, guest vs authentifié.

**Recherche** — debounce mesuré, résultats triés/filtrés, pagination, `SearchPage_ResultCard_Click_ShouldNavigateToProductPage` skippé quand 0 résultat.

**Espace utilisateur** — édition effective du profil (submit + persistance), suppression de compte, Top Up jusqu'à Stripe, détail d'une order, linked accounts Steam OAuth.

**Transverse** — responsive mobile, accessibilité clavier/lecteur d'écran, performance/Lighthouse, erreurs 404/500/backend indisponible, i18n, sessions expirées.

---

## Lancer les tests

### Prérequis

```bash
# Depuis la racine du repo
docker compose up -d auth frontend backend postgres postgres-game kafka

# Seed du user de test si absent (test@example.com / password)
docker exec condensation-auth-1 php artisan db:seed --force
```

Vérification rapide :
```bash
curl -o /dev/null -w "%{http_code}\n" http://localhost:4000
curl -o /dev/null -w "%{http_code}\n" http://localhost:8000
curl -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/games
```

### Exécution locale

```bash
cd e2e-tests

dotnet test                                                   # suite complète (~40 min)
dotnet test --filter "FullyQualifiedName~CartTests"           # une fixture
dotnet test --filter "Name=HomePage_ShouldLoadSuccessfully"   # un test
dotnet test --logger "console;verbosity=detailed"             # logs par test

E2E_TIMEOUT=20000 E2E_BASE_URL=http://localhost:4000 dotnet test
```

### Exécution en conteneur (CI)

```bash
./e2e-tests/run-tests.sh
```

Le script vérifie le seed puis lance `docker compose up --build --abort-on-container-exit` avec le profil `e2e`. Le `Dockerfile` installe Chromium avec `--with-deps` et utilise `-c Release`.

### Mode graphique (debug)

Éditer `.runsettings` :
```xml
<Headless>false</Headless>
```

---

## Points de vigilance

### Hydratation Next.js

Le `load` event n'est jamais déclenché par Turbopack dev à cause des WebSockets HMR. La convention adoptée :

- Toute navigation passe par `GoToAsync` (ou `NavigateAsync` du POM) qui combine `DOMContentLoaded` + un wait best-effort de 5 s sur `Load` (tolérant l'`TimeoutException`).
- Avant d'interagir avec un composant client (input contrôlé, dropdown), le wait Load laisse à React le temps d'attacher ses handlers.

### Sélecteur footer

Next.js dev injecte un `<footer class="error-overlay-footer">` qui capturait le `.Last`. Le sélecteur est maintenant :
```
body > footer, footer:not([data-nextjs-error-overlay-footer])
```

### Cart icon

Le composant `Header` rend un `<Link>` Next.js → balise `<a>`, pas un `<button>`. Sélecteur correct : `header a[aria-label='Cart']`.

### Formulaires d'auth

`/login` et `/register` sont servis par le service Laravel (port 8000, accessible via redirect OAuth). Les tests de register vérifient uniquement la présence des champs — **aucun compte réel n'est créé**.

### Panier Zustand

Store en mémoire par contexte. Chaque test démarrant dans un contexte vierge, le panier est toujours vide au `[SetUp]`. Les tests « with item » reproduisent le parcours utilisateur complet (Catalogue → Produit → Add to Cart → Cart).

### Données backend requises

Les tests dépendent de données réelles servies par `GET /api/games`. Sans seed :
- `Catalog_ShouldDisplayAtLeastFourGameCards` échoue
- `Search_*` avec requêtes spécifiques (« counter-strike », « elden ring ») deviennent `Inconclusive`

Prévoir un seed minimal pour la CI (déjà présent via `scripts/seed_games.sql`).
