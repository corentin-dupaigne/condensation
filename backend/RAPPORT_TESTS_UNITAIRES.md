# Rapport — Suite de tests unitaires Condensation (backend)

## Stack

| Élément | Valeur |
|---|---|
| Framework | JUnit Jupiter (5.x via spring-boot-starter-webmvc-test) |
| Mocking | Mockito (`MockitoExtension`, `@Mock`, `@InjectMocks`, `ArgumentCaptor`) |
| Assertions | AssertJ (`assertThat`, `assertThatThrownBy`) |
| Langage / runtime | Java 17 · Spring Boot 4.0.4 |
| Base de données (tests) | H2 en mémoire (dialecte PostgreSQL, `ddl-auto=create-drop`) |
| Mapper | MapStruct 1.6.3 |

Résultat de la dernière exécution : **92 tests · 0 échec**.

---

## Arborescence

```
backend/src/test/java/fr/fullstack/backend/unit/
├── controller/
│   ├── BalanceControllerTest.java          # 4 tests
│   ├── OrderControllerTest.java            # 5 tests
│   ├── FeatureControllerTest.java          # 2 tests
│   └── GameControllerTest.java             # 7 tests
├── dto/
│   ├── DtoRecordsTest.java                 # 11 tests
│   └── ApiErrorTest.java                   # 2 tests
├── entity/
│   └── EntityTest.java                     # 13 tests
├── service/
│   ├── GameServiceTest.java                # 10 tests
│   ├── BalanceServiceTest.java             # 8 tests
│   ├── FeatureServiceTest.java             # 6 tests
│   └── OrderServiceTest.java               # 10 tests
└── mapper/
    └── CatalogMapperTest.java              # 14 tests
```

Ressources de test : `src/test/resources/application-test.properties` (H2, `create-drop`).

---

## Méthodologie

### Stratégie par couche

| Couche testée | Approche | Objectif |
|---|---|---|
| `@RestController` | `MockitoExtension` + mocks services/mappers | Vérifier statuts HTTP, forme de réponse, délégation au service |
| `@Service` | `MockitoExtension` + mocks repositories | Valider règles métier, validations, effets de bord |
| Mappers (MapStruct) | JUnit simple + stub anonyme | Tester méthodes utilitaires (`calculatePriceFinal`, `stringToJsonNode`, `toPageDto`) |
| DTOs (records) | JUnit simple, sans mock | Constructeurs, accesseurs, `equals` / `hashCode` |
| Entités JPA | JUnit simple, sans contexte Spring | Getters/setters, valeurs par défaut, contrat `equals` des clés composites |

### Patterns récurrents

- **`@BeforeEach`** pour factoriser les fixtures (`Game`, `Balance`, `PageRequest`).
- **`ArgumentCaptor`** lorsqu'un objet construit dans le service doit être inspecté (ex. création d'une `Balance` à 0 pour un nouvel utilisateur, traduction `OrderRequestItem` → `OrderService.OrderRequestItem`).
- **`verify(..., never())`** systématique pour prouver l'absence d'effet de bord sur les chemins d'erreur (solde insuffisant, stock insuffisant, entité inexistante).
- **`thenReturn(a).thenReturn(b)`** chaîné pour simuler des appels successifs au même mock (ex. `findFirstByGameId` dans `OrderServiceTest.createOrder_keyDisappearsBeforeClaim_throwsConcurrencyError`).
- **`assertThatThrownBy`** avec vérification du message pour les exceptions métier.

### Isolation

- Chaque classe de test instancie ses propres mocks via `MockitoExtension` → aucun partage d'état entre tests.
- Pas de contexte Spring chargé pour les tests unitaires (rapide, < 5 s sur l'ensemble de la suite).
- Les tests d'entités restent au niveau POJO : pas de `@DataJpaTest`, pas d'H2 pour ces tests.

---

## Couverture par fixture

### Controllers (18 tests)

| Fixture | Tests | Portée |
|---|---:|---|
| `BalanceControllerTest` | 4 | `GET /balance`, `POST /balance` (succès, solde à zéro, update OK/KO) |
| `OrderControllerTest` | 5 | `GET /orders`, `GET /orders/{id}`, `POST /orders` (mapping, items vides, capture d'argument) |
| `FeatureControllerTest` | 2 | `GET /feature` — DTO complet + appel des trois seuils low deals (5 / 10 / 20 €) |
| `GameControllerTest` | 7 | Catalogue (pagination, filtres genre/recherche), détail, suppression 204, genres, key counts |

### Services (34 tests)

| Fixture | Tests | Règles métier testées |
|---|---:|---|
| `GameServiceTest` | 10 | Normalisation `null`/blank → `""`, forward search + genre au repository, `EntityNotFoundException` sur id inconnu, `verify(delete, never())` si absent |
| `BalanceServiceTest` | 8 | Crédit / débit, **rejet du découvert**, création d'un wallet à 0 pour un nouvel utilisateur, cas limite solde exactement à zéro, montant zéro = no-op |
| `FeatureServiceTest` | 6 | Délégation au repository + **conversion € → centimes** pour les low deals (5 → 500, 10 → 1000, 20 → 2000) |
| `OrderServiceTest` | 10 | Création de commande : validation du solde, du stock, application d'une réduction (`50 %` → prix ÷ 2), décrément du solde, suppression des `SteamKey`, gestion de la **race condition** (clé disparaît entre le count et le claim) |

### DTOs (13 tests)

| Fixture | Tests | Portée |
|---|---:|---|
| `DtoRecordsTest` | 11 | Records : `BalanceRequest`, `OrderRequest` (+ `OrderRequestItem`), `GenreDto`, `CategoryDto`, `CompanyDto`, `GameCompanyDto`, `PageDto`, `ScreenshotDto`, `MovieDto`, `OrderDto` (+ `GameInfo`), `FeatureDataDto` (+ `LowDealsDto`) |
| `ApiErrorTest` | 2 | Constructeur 4 arg (timestamp auto) vs 5 arg (timestamp fourni) |

### Entités (13 tests)

`EntityTest` couvre `Balance`, `Game`, `Genre`, `Category`, `Company`, `Order`, `SteamKey`, `Screenshot`, `Movie`, `GameCompany`, `GameCompanyId`.

Points vérifiés :
- Valeurs par défaut JPA : `Game.requiredAge == 0`, `platformWindows/Mac/Linux == false`.
- Contrat `equals`/`hashCode` de la clé composite `GameCompanyId` (réflexivité, symétrie, null, type safety).

### Mapper (14 tests)

`CatalogMapperTest` teste les méthodes utilitaires du mapper abstrait via une sous-classe anonyme :

| Méthode | Tests | Cas |
|---|---:|---|
| `calculatePriceFinal` | 6 | `null`, 0, négatif → prix inchangé · 50 % → moitié · 100 % → 0 |
| `toPageDto` | 2 | Contenu + pagination · page vide |
| `stringToJsonNode` | 4 | `null` · blank · JSON valide · JSON invalide |
| `toGameInfo` / `gameToGameInfo` | 2 | Genres nuls → liste vide · mapping `name` + `headerImage` |

---

## Répartition fonctionnelle

```
Panier / solde ............ 12 tests   (BalanceController + BalanceService)
Commandes ................. 15 tests   (OrderController + OrderService)
Catalogue ................. 17 tests   (GameController + GameService)
Mise en avant (features) ..  8 tests   (FeatureController + FeatureService)
Mapping / DTO / entités ... 40 tests   (CatalogMapper + DtoRecords + ApiError + Entity)
```

---

## Couverture — ce qui n'est pas testé

**Contrôleurs** — sérialisation/désérialisation HTTP réelle (pas de `@WebMvcTest` avec `MockMvc` : on teste la méthode Java directement, pas le binding JSON ni la validation Bean).

**Services** — aucun test d'intégration avec la base réelle (H2 configuré mais non utilisé en unitaire) → les requêtes JPQL/Criteria ne sont pas exécutées.

**Kafka** — aucun test de producer/consumer (la dépendance `spring-kafka-test` est présente dans `pom.xml` mais inutilisée).

**Sécurité** — pas de test sur les filtres d'auth OAuth, les annotations `@PreAuthorize`, ou la résolution du principal utilisateur.

**Mapping MapStruct** — seules les méthodes utilitaires (`calculatePriceFinal`, etc.) sont testées ; les méthodes générées (`toGameDetailsDto`, `toGameSummaryDto`) ne sont pas couvertes directement.

**Endpoints actuator / observabilité** — non testés.

---

## Lancer les tests

### Exécution complète

```bash
cd backend
./mvnw test
```

### Filtrage

```bash
# Un package
./mvnw test -Dtest='fr.fullstack.backend.unit.service.*'

# Une classe
./mvnw test -Dtest=OrderServiceTest

# Un test unique
./mvnw test -Dtest=OrderServiceTest#createOrder_success_createsOrdersAndDebitsBalance

# Seulement les tests de controllers
./mvnw test -Dtest='*ControllerTest'
```

### Rapports

Les rapports Surefire sont générés dans `backend/target/surefire-reports/` (XML + TXT par classe).

---

## Points de vigilance

### Validation du solde dans `BalanceService`

La règle métier « pas de solde négatif » est testée explicitement (`updateBalance_insufficientFunds_returnsFalseAndDoesNotSave`) avec `verify(repo, never()).save(...)`. Toute régression qui persisterait un montant négatif casserait ce test.

### Race condition sur les clés Steam

`OrderServiceTest.createOrder_keyDisappearsBeforeClaim_throwsConcurrencyError` chaîne deux `thenReturn` sur `findFirstByGameId` : le premier appel (comptage du stock) renvoie la clé, le second (claim effectif) renvoie `Optional.empty()`. Ce scénario simule une concurrence et doit lever une `IllegalStateException` sans débiter le solde.

### Conversion €→centimes dans `FeatureService`

Les trois seuils low deals sont codés en dur côté service (5 €, 10 €, 20 €) et multipliés par 100 avant la requête. `FeatureServiceTest` fige cette conversion — si la base passe à une autre unité (ex. millièmes), adapter les trois tests.

### Mapper abstrait testé par stub anonyme

`CatalogMapperTest` n'utilise pas l'implémentation générée par MapStruct : il instancie une sous-classe anonyme qui override les méthodes abstraites avec `return null;`. Ce choix permet de tester les `default` / méthodes utilitaires sans dépendre du code généré, au prix de ne pas couvrir le mapping complet.

### Couverture MapStruct

Les méthodes MapStruct générées (`toGameDetailsDto`, `toGameSummaryDto`) ne sont pas testées directement. Elles sont couvertes indirectement par les tests de `GameControllerTest` / `OrderControllerTest` où le mapper est mocké — donc **aucun test ne valide le mapping réel entity → DTO**. À ajouter si un bug de mapping apparaît.
