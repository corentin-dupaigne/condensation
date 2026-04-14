# Rapport — Suite de tests E2E Condensation

## Stack technique

| Élément | Valeur |
|---|---|
| Framework | Microsoft Playwright 1.58.0 |
| Runner | NUnit 4.5.1 |
| Langage | C# / .NET 10.0 |
| Navigateur | Chromium (headless, 1920×1080) |
| Configuration | `E2E_BASE_URL` (défaut : `http://localhost:4000`) |
| Timeout | `E2E_TIMEOUT` en ms (défaut : 30 000) |

---

## Architecture

### Structure des répertoires

```
e2e-tests/
├── Config/
│   └── TestSettings.cs          # BaseUrl et Timeout depuis variables d'environnement
├── Pages/                       # Couche Page Object Model
│   ├── BasePage.cs              # Classe abstraite — NavigateAsync, Header, Footer
│   ├── CartPage.cs
│   ├── CatalogPage.cs
│   ├── HomePage.cs
│   ├── LoginPage.cs
│   ├── ProductPage.cs
│   ├── RegisterPage.cs
│   ├── SearchPage.cs
│   └── Components/
│       ├── HeaderComponent.cs   # Logo, recherche, cart badge, auth links
│       └── FooterComponent.cs
└── Tests/
    ├── BaseTest.cs              # Hérite de PageTest — contexte Playwright par test
    ├── CartTests.cs
    ├── CatalogTests.cs
    ├── HeroCarouselTests.cs
    ├── HomeTests.cs
    ├── LoginTests.cs
    ├── NavigationTests.cs
    ├── ProductTests.cs
    ├── RegisterTests.cs
    └── SearchTests.cs
```

### Layering POM

```
BasePage (abstract)
  ├── PagePath        → propriété abstraite, ex. "/cart"
  ├── NavigateAsync() → GotoAsync + WaitForLoadState(NetworkIdle)
  ├── Header          → HeaderComponent (composant partagé)
  └── Footer          → FooterComponent (composant partagé)

CartPage, CatalogPage, HomePage … (extends BasePage)
  ├── Locators privés  (ILocator — jamais exposés)
  └── Méthodes publiques sémantiques
        IsEmptyCartVisibleAsync() → bool
        ClickAddToCartAsync()     → Task
        GetCartItemCountAsync()   → int
```

**Règles d'encapsulation :**
- Les `ILocator` sont toujours **privés** ; les tests ne manipulent jamais de locator directement.
- Les méthodes publiques retournent des types métier (`bool`, `string`, `int`) ou `Task`.
- Un seul endroit définit chaque locator — pas de duplication entre tests et POM.

---

## Méthodologie

### Hiérarchie de sélecteurs (du plus stable au moins stable)

| Priorité | Type | Exemple |
|---|---|---|
| 1 | ARIA (`aria-label`, `aria-current`, `role`) | `button[aria-label='Next slide']` |
| 2 | Sémantique HTML (`type`, `name`, `id`) | `input[type='checkbox']`, `#email` |
| 3 | Texte visible (`:has-text`) | `button:has-text('Add to Cart')` |
| 4 | Attribut structurel (`href`) | `a[href='/games']` |
| 5 *(évité)* | Classes CSS / Tailwind | fragile lors de refactos de style |

> Le HeroCarousel est entièrement testé via ARIA — aucune classe CSS dans ses sélecteurs.

### Attentes réseau

- `WaitForLoadStateAsync(NetworkIdle)` après chaque navigation.
- `WaitForAsync()` sur un élément précis plutôt que `WaitForTimeoutAsync` fixe.
- Exemple pour le feedback "Add to Cart" :

```csharp
await addToCartButton.ClickAsync();
// Attend le retour visuel de l'app, pas un délai arbitraire
await Page.Locator("button:has-text('Added!')").WaitForAsync(new() { Timeout = 5_000 });
```

- `WaitForTimeoutAsync` utilisé **uniquement** pour les transitions CSS/debounce documentées
  (ex. : 700 ms de fondu du carousel, 300 ms de debounce de recherche + 300 ms réseau = 900 ms).

### Isolation des tests

Chaque test reçoit un contexte Playwright frais (héritage `PageTest` de NUnit).  
Le store Zustand du panier repart à zéro à chaque test — aucun état partagé.

### Tests conditionnels

`Assert.Inconclusive` est utilisé quand une précondition ne peut pas être garantie par les données de test (ex. : moins de 2 miniatures sur un jeu), évitant ainsi les faux négatifs.

---

## Couverture des tests

### Récapitulatif par fixture

| Fixture | Tests | Cas couverts |
|---|---|---|
| `HomeTests` | 15 | Sections page (Recommended, Bestsellers, New Releases, Pre-Orders), game cards, newsletter (input, bouton, saisie), navigation premier jeu |
| `HeroCarouselTests` | 9 | Visibilité, rôle ARIA carousel, flèches Prev/Next, 5 dots, clic dot actif, premier dot par défaut, CTA BUY NOW lien et navigation |
| `CatalogTests` | 13 | Chargement, header/footer, game cards (count ≥ 4, liens `/games/\d+`), filter sidebar, checkboxes genre, toggle label, sort dropdown (ouverture, sélection, mise à jour label) |
| `ProductTests` | 14 | Titre, header/footer, breadcrumbs (count ≥ 2, navigation Home), Buy Now / Add to Cart / Wishlist visibles, feedback "Added!", badge cart header, éditions Standard (Steam key) et Deluxe (Steam price), galerie miniatures (count ≥ 1, clic change média) |
| `SearchTests` | 11 | Chargement, résultats avec requête valide, no-results avec requête invalide, popular searches sans query, popular search clic navigation, form submit mise à jour URL, clic résultat → page produit, compteur résultats visible, header search met à jour |
| `CartTests` | 17 | Empty state (message, liens Browse/Back to home, navigation), header/footer, with-item : titre, ≥ 1 ligne, order summary, checkout button, clear cart button, section Complete Your Order, increase qty, remove item → empty, clear cart → empty |
| `NavigationTests` | 11 | Logo → home, cart icon (Link ARIA) → /cart, Browse nav → /games, Store nav → /, search submit → /search?q=, preview dropdown apparition/Escape, Sign In/Up pointent vers auth, breadcrumb Home et Catalog |
| `LoginTests` | 12 | Chargement (titre "SIGN IN"), email + submit visibles, toggle password (show/restore), 5 OAuth providers, Sign up → /register, remplissage formulaire, Forgot password visible + navigation, formulaire vide bloqué, email invalide bloqué, tous OAuth visibles |
| `RegisterTests` | 11 | Chargement (titre "SIGN UP"), bouton disabled par défaut, enable après terms, toggle password, 5 OAuth providers, Sign in → /login, remplissage complet, double toggle terms restaure état, confirm password toggle, tous OAuth visibles, submit bloqué sans terms |
| **TOTAL** | **115** | |

### Répartition fonctionnelle

```
Navigation & routing ........ 11 tests  (NavigationTests)
Carousel & home ............. 24 tests  (HomeTests + HeroCarouselTests)
Catalogue & filtres ......... 13 tests  (CatalogTests)
Page produit ................ 14 tests  (ProductTests)
Panier ...................... 17 tests  (CartTests)
Recherche ................... 11 tests  (SearchTests)
Authentification ............ 23 tests  (LoginTests + RegisterTests)
```

---

## Fichiers créés / modifiés

### Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `Pages/CartPage.cs` | POM de la page `/cart` — état vide et panier rempli |
| `Tests/CartTests.cs` | 17 tests (empty state + flux UI complet add-to-cart) |
| `Tests/NavigationTests.cs` | 11 tests de navigation inter-pages via le header |
| `Tests/HeroCarouselTests.cs` | 9 tests du carousel via attributs ARIA |

### Fichiers étendus

| Fichier | Tests ajoutés |
|---|---|
| `Tests/HomeTests.cs` | +6 (newsletter, clic game card, Pre-Orders) |
| `Tests/CatalogTests.cs` | +8 (filtre genre, sort dropdown, liens game cards) |
| `Tests/ProductTests.cs` | +9 (CTA buttons, feedback, éditions, galerie) |
| `Tests/SearchTests.cs` | +5 (popular search, form submit, clic résultat, compteur) |
| `Tests/LoginTests.cs` | +5 (validation, forgot password, toggle restore) |
| `Tests/RegisterTests.cs` | +4 (double toggle, confirm password, validation) |

---

## Lancer les tests

```bash
# Prérequis : application démarrée sur localhost:4000
# (docker-compose up depuis la racine du projet)

# Tous les tests
cd e2e-tests
dotnet test

# Avec navigateur visible (debug)
dotnet test -- Playwright.LaunchOptions.Headless=false

# Filtrer par fixture
dotnet test --filter "CartTests"
dotnet test --filter "HeroCarousel"
dotnet test --filter "Navigation"

# Avec URL personnalisée
E2E_BASE_URL=https://staging.example.com dotnet test

# Avec timeout personnalisé (ms)
E2E_TIMEOUT=60000 dotnet test
```

---

## Points de vigilance

### Sélecteur cart icon
Le composant `Header` utilise un `<Link>` Next.js qui se rend en `<a>`, pas un `<button>`.  
Le sélecteur correct est `header a[aria-label='Cart']` et non `header button[aria-label='Cart']`.

### Formulaires d'authentification
Les pages `/login` et `/register` appartiennent au service Laravel (port 8000).  
Elles sont accessibles via le même domaine grâce au proxy Docker.  
Les tests de soumission de formulaire vérifient uniquement le comportement front-end (validation HTML5, état activé/désactivé) — aucun compte réel n'est créé.

### Panier Zustand
Le store est en mémoire (par onglet/contexte). Chaque test Playwright démarrant dans un contexte vierge, le panier est toujours vide en début de test. Les tests "with item" reproduisent le flux utilisateur complet (Catalogue → Produit → Add to Cart → Cart).

### Données de test
Les tests s'appuient sur les données réelles de la base de données de développement. Si la base est vide, plusieurs tests échoueront (game cards, résultats de recherche). Prévoir un jeu de données minimal pour l'environnement CI.
