#!/usr/bin/env bash
# Lance tous les services puis les tests e2e et génère un rapport HTML.
#
# Usage :
#   ./run-e2e-with-report.sh                               # tous les tests
#   ./run-e2e-with-report.sh -f "FullyQualifiedName~Cart"  # filtre (syntaxe dotnet test --filter)
#   ./run-e2e-with-report.sh --filter "TestCategory=Smoke"
#   ./run-e2e-with-report.sh --class CartTests             # raccourci : tous les tests de la classe CartTests
#   ./run-e2e-with-report.sh --name AddToCart              # raccourci : tests dont le nom contient "AddToCart"
#   ./run-e2e-with-report.sh --list                        # liste les tests disponibles (ne lance rien)
#   ./run-e2e-with-report.sh --headed                      # navigateur visible (par défaut headless)
#   ./run-e2e-with-report.sh --headed --slow-mo 250        # headed + 250 ms entre chaque action
#   ./run-e2e-with-report.sh --timeout 1500                # ajuste le timeout fast-fail (défaut 3000 ms)
#   ./run-e2e-with-report.sh --no-fast-fail                # désactive fast-fail (timeouts longs : 30/5/20 s)
#
# Variables d'env :
#   KEEP_SERVICES=1  laisse les services tournants à la fin
#   SKIP_SERVICES=1  suppose que les services tournent déjà
#   FILTER=…         équivalent à --filter (l'argument CLI a priorité)
#   HEADED=1         équivalent à --headed
#   FAST_FAIL=0      désactive le fast-fail (activé par défaut)

set -euo pipefail

usage() {
    sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
    exit "${1:-0}"
}

FILTER="${FILTER:-}"
LIST_ONLY=0
HEADED="${HEADED:-0}"
SLOW_MO=""
FAST_FAIL="${FAST_FAIL:-1}"
FAST_FAIL_TIMEOUT=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--filter)       FILTER="$2"; shift 2 ;;
        --class)           FILTER="FullyQualifiedName~.${2}."; shift 2 ;;
        --name)            FILTER="FullyQualifiedName~${2}"; shift 2 ;;
        --list)            LIST_ONLY=1; shift ;;
        --headed)          HEADED=1; shift ;;
        --headless)        HEADED=0; shift ;;
        --slow-mo)         SLOW_MO="$2"; shift 2 ;;
        --fast-fail)       FAST_FAIL=1; shift ;;
        --no-fast-fail)    FAST_FAIL=0; shift ;;
        --timeout)         FAST_FAIL_TIMEOUT="$2"; shift 2 ;;
        -h|--help)         usage 0 ;;
        *) echo "Option inconnue : $1" >&2; usage 1 ;;
    esac
done

# Paramètres runsettings Playwright passés à dotnet test derrière '--'
PW_ARGS=()
if [[ "$HEADED" == "1" ]]; then
    PW_ARGS+=("Playwright.LaunchOptions.Headless=false")
fi
if [[ -n "$SLOW_MO" ]]; then
    PW_ARGS+=("Playwright.LaunchOptions.SlowMo=$SLOW_MO")
fi

# Fast-fail : réduit les timeouts Playwright et NUnit pour qu'un test qui plante
# (élément manquant, écran d'erreur Next.js…) échoue rapidement au lieu
# d'attendre 15 s de polling sur l'action et 5 s de polling sur l'assertion.
# Valeur par défaut 8000 ms : compromis pour laisser à Next.js dev le temps
# de compiler une page à la volée au premier hit (peut prendre 3–6 s).
if [[ "$FAST_FAIL" == "1" ]]; then
    FF_TIMEOUT="${FAST_FAIL_TIMEOUT:-8000}"
    # Expect polling : ~2/3 du timeout d'action — laisse un peu de marge aux assertions.
    FF_EXPECT=$(( FF_TIMEOUT * 2 / 3 ))
    # NUnit hard cap par test : généreux (3×) pour inclure setUp/login/teardown.
    FF_NUNIT=$(( FF_TIMEOUT * 3 ))
    export E2E_TIMEOUT="$FF_TIMEOUT"
    PW_ARGS+=("Playwright.ExpectTimeout=$FF_EXPECT" "NUnit.DefaultTimeout=$FF_NUNIT")
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$SCRIPT_DIR/TestResults"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TRX_FILE="results-${TIMESTAMP}.trx"
HTML_FILE="$REPORT_DIR/report-${TIMESTAMP}.html"
HTML_LATEST="$REPORT_DIR/report-latest.html"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $*"; }
ok()   { echo -e "${GREEN}[$(date +%H:%M:%S)] OK${NC}    $*"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN${NC}  $*"; }
err()  { echo -e "${RED}[$(date +%H:%M:%S)] ERROR${NC} $*" >&2; }

cleanup() {
    if [[ "${SKIP_SERVICES:-0}" == "1" || "${KEEP_SERVICES:-0}" == "1" ]]; then
        warn "Services laissés en marche (KEEP_SERVICES=1 ou SKIP_SERVICES=1)"
        return
    fi
    log "Arrêt des services…"
    ( cd "$PROJECT_ROOT" && docker compose down --remove-orphans ) >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_http() {
    local url="$1" name="$2" max="${3:-90}"
    log "Attente de $name ($url)…"
    for ((i=1; i<=max; i++)); do
        if curl -fsS -o /dev/null --max-time 2 "$url"; then
            ok "$name prêt"
            return 0
        fi
        sleep 2
    done
    err "$name n'a pas démarré en $((max*2))s"
    return 1
}

# --- 0. Mode liste -------------------------------------------------------
if [[ "$LIST_ONLY" == "1" ]]; then
    log "Liste des tests disponibles :"
    dotnet test "$SCRIPT_DIR/Condensation.E2E.Tests.csproj" --list-tests \
        ${FILTER:+--filter "$FILTER"} | sed -n '/The following Tests are available/,$p'
    trap - EXIT
    exit 0
fi

# --- 1. Services ---------------------------------------------------------
if [[ "${SKIP_SERVICES:-0}" != "1" ]]; then
    log "Démarrage des services via docker compose…"
    ( cd "$PROJECT_ROOT" && docker compose up -d --build \
        postgres postgres-game kafka auth backend frontend )
else
    warn "SKIP_SERVICES=1 — on suppose que tout tourne déjà"
fi

wait_http "http://localhost:8000"  "auth"     60
wait_http "http://localhost:8080/actuator/health" "backend" 90 \
    || wait_http "http://localhost:8080" "backend" 30
wait_http "http://localhost:4000"  "frontend" 90

# --- 2. Seed auth DB -----------------------------------------------------
log "Vérification du seed auth…"
if ! docker exec condensation-postgres-1 psql -U postgres -d auth_db -tAc \
        "SELECT 1 FROM users WHERE email='test@example.com'" 2>/dev/null | grep -q 1; then
    log "Seed de l'utilisateur de test…"
    docker exec condensation-auth-1 php artisan db:seed --force
else
    ok "Seed déjà présent"
fi

# --- 3. Tests ------------------------------------------------------------
mkdir -p "$REPORT_DIR"
mode_label="headless"; [[ "$HEADED" == "1" ]] && mode_label="headed"
if [[ "$FAST_FAIL" == "1" ]]; then
    mode_label="$mode_label, fast-fail ${FF_TIMEOUT}ms"
else
    mode_label="$mode_label, no fast-fail"
fi
if [[ -n "$FILTER" ]]; then
    log "Lancement des tests e2e ($mode_label — filtre : $FILTER)…"
else
    log "Lancement des tests e2e ($mode_label — tous)…"
fi

test_rc=0
E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:4000}" \
E2E_TIMEOUT="${E2E_TIMEOUT:-30000}" \
dotnet test "$SCRIPT_DIR/Condensation.E2E.Tests.csproj" \
    --logger "trx;LogFileName=${TRX_FILE}" \
    --logger "console;verbosity=normal" \
    --results-directory "$REPORT_DIR" \
    ${FILTER:+--filter "$FILTER"} \
    ${PW_ARGS:+-- "${PW_ARGS[@]}"} \
    || test_rc=$?

TRX_PATH="$REPORT_DIR/$TRX_FILE"
# Si le TRX attendu n'existe pas (dotnet test interrompu avant la fin, build
# cancel, Ctrl+C…), on tente de récupérer le plus récent dans le dossier avant
# d'abandonner — utile aussi quand dotnet écrit sous un nom légèrement différent.
if [[ ! -f "$TRX_PATH" ]]; then
    fallback_trx="$(ls -t "$REPORT_DIR"/*.trx 2>/dev/null | head -n1 || true)"
    if [[ -n "$fallback_trx" ]]; then
        warn "TRX attendu introuvable — utilisation du plus récent : $fallback_trx"
        TRX_PATH="$fallback_trx"
    else
        err "Aucun fichier TRX produit — dotnet test a probablement été interrompu avant d'écrire ses résultats."
        err "Voir la sortie console ci-dessus pour le détail des erreurs. Code de sortie dotnet : ${test_rc:-?}"
        exit "${test_rc:-1}"
    fi
fi

# --- 4. Rapport HTML -----------------------------------------------------
log "Génération du rapport HTML…"
python3 "$SCRIPT_DIR/trx-to-html.py" "$TRX_PATH" "$HTML_FILE"
cp -f "$HTML_FILE" "$HTML_LATEST"
ok "Rapport : $HTML_FILE"
ok "Lien stable : $HTML_LATEST"

exit "$test_rc"
