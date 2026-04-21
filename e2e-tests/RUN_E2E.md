# Lancement des tests e2e avec rapport HTML

Le script `run-e2e-with-report.sh` automatise **tout** le cycle :

1. démarrage des services (`docker compose up -d` : postgres, postgres-game, kafka, auth, backend, frontend) ;
2. attente de la disponibilité HTTP de chaque service (auth:8000, backend:8080, frontend:4000) ;
3. seed conditionnel de l'utilisateur de test (`test@example.com`) si absent ;
4. exécution de `dotnet test` avec export TRX ;
5. génération d'un **rapport HTML** autonome (thème sombre, résumé, groupement par classe, détail d'erreur + stack trace pour les échecs) ;
6. arrêt des services à la fin (sauf si `KEEP_SERVICES=1`).

## Pré-requis

- Docker + Docker Compose v2
- .NET SDK 10
- `python3` (stdlib uniquement, aucune dépendance externe)
- `curl`

## Usage de base

```bash
cd e2e-tests
./run-e2e-with-report.sh
```

Le rapport est écrit dans :

- `TestResults/report-<timestamp>.html` — archive horodatée
- `TestResults/report-latest.html` — lien stable vers le dernier run

Pour l'ouvrir :

```bash
xdg-open TestResults/report-latest.html
```

## Filtrer les tests

Quatre façons, de la plus simple à la plus expressive :

| Option CLI | Exemple | Effet |
|---|---|---|
| `--class <Classe>` | `./run-e2e-with-report.sh --class CartTests` | tous les tests de la classe `CartTests` |
| `--name <motif>` | `./run-e2e-with-report.sh --name AddToCart` | tests dont le nom contient `AddToCart` |
| `-f` / `--filter <expr>` | `./run-e2e-with-report.sh -f "TestCategory=Smoke"` | expression `dotnet test --filter` brute |
| `--list` | `./run-e2e-with-report.sh --list` | liste les tests sans rien lancer (ne démarre **pas** les services) |
| `--headed` / `--headless` | `./run-e2e-with-report.sh --headed` | mode visible / caché du navigateur (défaut : `--headless`) |
| `--slow-mo <ms>` | `./run-e2e-with-report.sh --headed --slow-mo 250` | ralentit chaque action Playwright |
| `--timeout <ms>` | `./run-e2e-with-report.sh --timeout 4000` | ajuste la valeur `fast-fail` (défaut 8000 ms) |
| `--no-fast-fail` | `./run-e2e-with-report.sh --no-fast-fail` | désactive le fast-fail — timeouts longs (30 / 5 / 20 s) |

La syntaxe complète de `--filter` (opérateurs `&`, `|`, `!`, `~`, `=`, `!=`) est disponible via `-f`. Quelques exemples :

```bash
# Plusieurs classes
./run-e2e-with-report.sh -f "FullyQualifiedName~CartTests|FullyQualifiedName~CheckoutTests"

# Un test unique
./run-e2e-with-report.sh -f "FullyQualifiedName=Condensation.E2E.Tests.Tests.CartTests.AddToCart_ShowsFeedback"

# Exclure une classe
./run-e2e-with-report.sh -f "FullyQualifiedName!~HeroCarouselTests"

# Lister ce qui matche un filtre avant de lancer
./run-e2e-with-report.sh --list --class UserJourneyTests
```

La variable d'env `FILTER` est également supportée (l'argument CLI a priorité) :

```bash
FILTER="FullyQualifiedName~Cart" ./run-e2e-with-report.sh
```

## Mode headed / headless

Par défaut les tests tournent en **headless** (aucune fenêtre de navigateur). Pour observer l'exécution :

```bash
./run-e2e-with-report.sh --headed                 # navigateur visible
./run-e2e-with-report.sh --headed --slow-mo 250   # ralentit chaque action de 250 ms
./run-e2e-with-report.sh --headless               # forçage explicite (comportement par défaut)
```

Équivalents env : `HEADED=1 ./run-e2e-with-report.sh`. Sous le capot, ces options sont passées à Playwright via les runsettings `Playwright.LaunchOptions.Headless` et `Playwright.LaunchOptions.SlowMo`.

> ⚠️ Le mode headed nécessite un serveur d'affichage (X11 / Wayland). En CI ou via SSH sans `$DISPLAY`, reste en headless.

## Mode fast-fail (activé par défaut)

Par défaut Playwright fait du **polling** sur les actions (`Click`, `Fill`…) et les assertions (`Expect(...).ToBeVisibleAsync()`) : 15 s et 5 s respectivement. Un test qui plante (page d'erreur Next.js, backend 500, élément jamais rendu) reste donc bloqué jusqu'à expiration du timeout avant d'échouer.

Le script abaisse ces timeouts **par défaut** pour échouer vite. Pour ajuster ou désactiver :

```bash
./run-e2e-with-report.sh                  # fast-fail à 8000 ms (défaut)
./run-e2e-with-report.sh --timeout 4000   # plus agressif une fois Next.js déjà chaud
./run-e2e-with-report.sh --no-fast-fail   # désactive : retour aux timeouts longs
```

| Timeout | `--no-fast-fail` | Défaut (8000 ms) | `--timeout 4000` |
|---|---:|---:|---:|
| `Page.DefaultTimeout` / navigation (`E2E_TIMEOUT`) | 30 000 ms | 8 000 ms | 4 000 ms |
| `Playwright.ExpectTimeout` (assertions) | 5 000 ms | ~5 333 ms | ~2 666 ms |
| `NUnit.DefaultTimeout` (cap par test) | 20 000 ms | 24 000 ms | 12 000 ms |

> ℹ️ La valeur 8000 ms par défaut est un compromis : Next.js en mode dev compile chaque page au premier hit (3–6 s), donc un timeout plus bas fait échouer des tests sains sur une session fraîchement démarrée. Une fois les routes déjà compilées (second run dans la même session), `--timeout 4000` suffit largement.

> ⚠️ Pour la CI ou après un restart à froid des services, préférer `--no-fast-fail` pour le premier tour complet, puis basculer en fast-fail pour les itérations suivantes.

## Variables d'environnement

| Variable | Défaut | Rôle |
|---|---|---|
| `KEEP_SERVICES` | `0` | `1` = laisse les conteneurs tournants après les tests |
| `SKIP_SERVICES` | `0` | `1` = ne tente pas `docker compose up` (services déjà lancés) |
| `FILTER` | *(vide)* | filtre par défaut si `--filter` n'est pas passé |
| `HEADED` | `0` | `1` = navigateur visible (équivalent `--headed`) |
| `FAST_FAIL` | `1` | `0` = désactive le fast-fail (équivalent `--no-fast-fail`) |
| `E2E_BASE_URL` | `http://localhost:4000` | URL de base côté frontend pour Playwright |
| `E2E_TIMEOUT` | `30000` | timeout Playwright par défaut (ms) |

## Recettes courantes

**Itérer rapidement sur une fixture sans redémarrer les services** — premier run normal, puis :

```bash
KEEP_SERVICES=1 ./run-e2e-with-report.sh --class CartTests
SKIP_SERVICES=1 ./run-e2e-with-report.sh --class CartTests  # ré-exécute sans relancer docker
```

**Lancer uniquement les smoke tests en CI** :

```bash
./run-e2e-with-report.sh -f "TestCategory=Smoke"
```

**Debug d'un test qui échoue** — relancer juste celui-là, navigateur visible, au ralenti :

```bash
./run-e2e-with-report.sh --name LoginWithInvalidCredentials_ShowsError --headed --slow-mo 500
```

**Premier run après un cold start** — garder les timeouts larges le temps que Next.js ait tout compilé :

```bash
./run-e2e-with-report.sh --no-fast-fail
```

Puis ouvrir `TestResults/report-latest.html` : les échecs sont affichés en premier dans chaque fixture, avec message d'erreur et stack trace dépliables.

## Code de sortie

Le script propage le code de sortie de `dotnet test` : `0` si tous les tests passent, `1` sinon. Utilisable tel quel dans un pipeline CI.

## Fichiers

- `run-e2e-with-report.sh` — orchestrateur
- `trx-to-html.py` — convertisseur TRX → HTML (stdlib Python uniquement)
- `TestResults/` — sortie (TRX + HTML), créé automatiquement
