#!/usr/bin/env bash
# Creates GitHub task issues from user stories.
# Usage: ./create-tasks.sh [--repo owner/repo] [--label task]
# Requires: gh CLI authenticated (gh auth login)

set -euo pipefail

LABEL="task"
REPO_FLAG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo) REPO_FLAG="--repo $2"; shift 2 ;;
    --label) LABEL="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

create_issue() {
  local title="$1"
  local body="$2"
  echo "Creating issue: Task: $title"
  # shellcheck disable=SC2086
  gh issue create \
    $REPO_FLAG \
    --title "Task: $title" \
    --body "$body" \
    --label "$LABEL"
  echo "Done: Task: $title"
}

# ─── Story: CAT.1 - IGDB Data Synchronization ─────────────────────────────────

create_issue "CAT.1.1 - Set up IGDB API credentials & auth client" "$(cat <<'EOF'
Story: CAT.1 - IGDB Data Synchronization

## Context & Requirements

As a platform admin, I want the Fetch_api service to authenticate with the IGDB API
So that subsequent data fetch calls are authorized.

## Acceptance Criteria

- [ ] `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` loaded from environment variables.
- [ ] Auth token fetched from Twitch OAuth endpoint on service startup.
- [ ] Token refresh handled automatically before expiry.
- [ ] Unit tested with mocked OAuth responses.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.1.2 - Implement game data fetch (title, genre, platform, cover, rating)" "$(cat <<'EOF'
Story: CAT.1 - IGDB Data Synchronization

## Context & Requirements

As a platform admin, I want the Fetch_api service to retrieve full game records from IGDB
So that the catalog has rich, structured data for each game.

## Acceptance Criteria

- [ ] Fetch returns fields: id, name, genres, platforms, cover, summary, rating.
- [ ] Supports batch fetching using IGDB fields/limit params.
- [ ] Unit tested with mocked IGDB API responses.

## Data & Event Tasks

- [ ] Update DB Schema: N/A (consumed by CAT.1.4)
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.1.3 - Create scheduled sync job with configurable interval" "$(cat <<'EOF'
Story: CAT.1 - IGDB Data Synchronization

## Context & Requirements

As a platform admin, I want the sync to run automatically on a schedule
So that new IGDB data is imported without manual intervention.

## Acceptance Criteria

- [ ] Sync runs on a configurable cron expression (default: nightly at 02:00).
- [ ] Only fetches records updated since the last successful sync (using IGDB `updated_at` filter).
- [ ] Sync start, end time, and record count are logged.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `game.synced` after each successful sync batch.
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Store timestamp of last successful sync.
EOF
)"

create_issue "CAT.1.4 - Add retry logic & structured error logging for failed syncs" "$(cat <<'EOF'
Story: CAT.1 - IGDB Data Synchronization

## Context & Requirements

As a platform admin, I want failed syncs to retry automatically and log failures
So that transient errors do not silently drop game data.

## Acceptance Criteria

- [ ] Failed API calls retried up to 3 times with exponential backoff.
- [ ] Persistent failures logged with game ID, error message, and timestamp.
- [ ] A single record failure does not abort the entire sync batch.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: CAT.2 - Game Search & Filtering API ────────────────────────────────

create_issue "CAT.2.1 - Add full-text search & filter indexes to games table" "$(cat <<'EOF'
Story: CAT.2 - Game Search & Filtering API

## Context & Requirements

As a backend developer, I want optimized indexes on the games table
So that search queries are fast even with a large catalog.

## Acceptance Criteria

- [ ] Full-text GIN index on `games.name` and `games.summary`.
- [ ] B-tree indexes on `genre_id`, `platform_id`, `rating`, `release_date`.
- [ ] Migration is versioned and reversible.

## Data & Event Tasks

- [ ] Update DB Schema: Add indexes to `games` table.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.2.2 - Implement search endpoint with text query + filter params" "$(cat <<'EOF'
Story: CAT.2 - Game Search & Filtering API

## Context & Requirements

As a user, I want to search games by name and filter by multiple criteria
So that I can narrow down the catalog to exactly what I need.

## Acceptance Criteria

- [ ] `GET /games/search` accepts: `q` (text), `genre`, `platform`, `price_min`, `price_max`, `release_year`.
- [ ] Returns paginated list of matching games with total count.
- [ ] Returns 400 with error details on invalid query params.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.2.3 - Add sorting & pagination to search results" "$(cat <<'EOF'
Story: CAT.2 - Game Search & Filtering API

## Context & Requirements

As a user, I want to sort and paginate search results
So that I can browse large result sets efficiently.

## Acceptance Criteria

- [ ] Supports `sort_by`: `relevance`, `price`, `rating`, `release_date`.
- [ ] Supports `sort_order`: `asc`, `desc`.
- [ ] Response includes `total`, `page`, `page_size`, and `next_cursor`.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.2.4 - Cache frequent search queries in Redis" "$(cat <<'EOF'
Story: CAT.2 - Game Search & Filtering API

## Context & Requirements

As a backend developer, I want popular search results cached in Redis
So that repeated queries are served without hitting the database.

## Acceptance Criteria

- [ ] Search results cached with a 5-minute TTL.
- [ ] Cache key derived from normalized, sorted query params.
- [ ] Cache invalidated on `game.updated` Kafka event for affected games.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `game.updated` to invalidate stale cache entries.
- [ ] Update Redis state: Store search result cache with TTL.
EOF
)"

# ─── Story: CAT.3 - Swagger API Documentation ─────────────────────────────────

create_issue "CAT.3.1 - Annotate catalog endpoints with OpenAPI specs" "$(cat <<'EOF'
Story: CAT.3 - Swagger API Documentation

## Context & Requirements

As a developer, I want all game catalog endpoints documented with OpenAPI annotations
So that consumers know exactly what to send and what to expect.

## Acceptance Criteria

- [ ] All `/games/*` endpoints annotated with `@Operation` and `@ApiResponse`.
- [ ] Request params and response DTOs annotated with `@Schema` and descriptions.
- [ ] Error responses (400, 404, 500) documented per endpoint.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.3.2 - Annotate auth/user endpoints with OpenAPI specs" "$(cat <<'EOF'
Story: CAT.3 - Swagger API Documentation

## Context & Requirements

As a developer, I want all auth and user endpoints documented with OpenAPI annotations
So that authentication flows are clearly described.

## Acceptance Criteria

- [ ] All `/auth/*` and `/users/*` endpoints annotated.
- [ ] Auth header requirements documented per endpoint (Bearer token).
- [ ] Error responses (401, 403) documented.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "CAT.3.3 - Configure and expose Swagger UI at /api/docs" "$(cat <<'EOF'
Story: CAT.3 - Swagger API Documentation

## Context & Requirements

As a developer, I want a browsable Swagger UI available at a known URL
So that I can explore and test the API interactively.

## Acceptance Criteria

- [ ] Swagger UI accessible at `/api/docs`.
- [ ] OpenAPI JSON spec available at `/api/docs/openapi.json`.
- [ ] Swagger UI disabled or access-restricted in production environment.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: INF.1 - IaC with Terraform & Ansible ──────────────────────────────

create_issue "INF.1.1 - Write Terraform module for networking (VPC, subnets)" "$(cat <<'EOF'
Story: INF.1 - IaC with Terraform & Ansible

## Context & Requirements

As a DevOps engineer, I want networking resources defined as code
So that the network layer can be reproduced and versioned.

## Acceptance Criteria

- [ ] Module provisions VPC, public/private subnets, and security groups.
- [ ] Outputs: VPC ID, subnet IDs, security group IDs.
- [ ] Variables documented in `variables.tf` with descriptions and defaults.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.1.2 - Write Terraform module for compute resources" "$(cat <<'EOF'
Story: INF.1 - IaC with Terraform & Ansible

## Context & Requirements

As a DevOps engineer, I want compute resources defined as code
So that nodes can be provisioned consistently across environments.

## Acceptance Criteria

- [ ] Module provisions compute nodes (VMs or managed node pool).
- [ ] Supports configurable instance count and instance type.
- [ ] Nodes tagged with environment name (preprod/prod).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.1.3 - Configure remote Terraform state backend" "$(cat <<'EOF'
Story: INF.1 - IaC with Terraform & Ansible

## Context & Requirements

As a DevOps engineer, I want Terraform state stored remotely with locking
So that multiple engineers can safely run Terraform without conflicts.

## Acceptance Criteria

- [ ] State stored in an S3-compatible bucket.
- [ ] State locking configured (DynamoDB or equivalent).
- [ ] Backend configuration defined in `backend.tf` and documented in README.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.1.4 - Write Ansible playbooks for OS-level dependencies" "$(cat <<'EOF'
Story: INF.1 - IaC with Terraform & Ansible

## Context & Requirements

As a DevOps engineer, I want OS-level configuration automated via Ansible
So that provisioned nodes are ready to run services without manual setup.

## Acceptance Criteria

- [ ] Playbook installs Docker, Java JRE, and required system packages.
- [ ] Playbooks are idempotent (safe to run multiple times).
- [ ] Variables externalized in `group_vars` per environment.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: INF.2 - Kubernetes Orchestration ──────────────────────────────────

create_issue "INF.2.1 - Write K8s Deployment & Service manifests for each micro-service" "$(cat <<'EOF'
Story: INF.2 - Kubernetes Orchestration

## Context & Requirements

As a DevOps engineer, I want every micro-service defined as a K8s Deployment and Service
So that services can be deployed and reached within the cluster.

## Acceptance Criteria

- [ ] Deployment manifests for: `auth`, `fetch_api`, `notification`, `recommendation`.
- [ ] Resource requests and limits defined for each container.
- [ ] Liveness and readiness probes configured per service.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.2.2 - Configure ConfigMaps & Secrets for environment variables" "$(cat <<'EOF'
Story: INF.2 - Kubernetes Orchestration

## Context & Requirements

As a DevOps engineer, I want config and secrets managed via K8s primitives
So that sensitive values are not hardcoded in manifests or images.

## Acceptance Criteria

- [ ] Non-sensitive config (Kafka topic names, feature flags) stored in ConfigMaps.
- [ ] Sensitive values (DB passwords, API keys) stored in K8s Secrets.
- [ ] Values mounted as environment variables in Deployment specs.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.2.3 - Set up HPA for critical services" "$(cat <<'EOF'
Story: INF.2 - Kubernetes Orchestration

## Context & Requirements

As a DevOps engineer, I want critical services to auto-scale under load
So that the platform handles traffic spikes without manual intervention.

## Acceptance Criteria

- [ ] HPA defined for `fetch_api` and `recommendation` services.
- [ ] Scales on CPU utilization threshold of 70%.
- [ ] Min replicas: 2, max replicas: 10 (configurable).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.2.4 - Create preprod & prod namespaces with RBAC" "$(cat <<'EOF'
Story: INF.2 - Kubernetes Orchestration

## Context & Requirements

As a DevOps engineer, I want environment isolation enforced at the namespace level
So that preprod workloads cannot interfere with production.

## Acceptance Criteria

- [ ] `preprod` and `prod` namespaces created.
- [ ] ServiceAccounts with least-privilege RBAC roles per namespace.
- [ ] NetworkPolicies restricting cross-namespace traffic.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: INF.3 - CI/CD Pipeline Automation ─────────────────────────────────

create_issue "INF.3.1 - Set up CI pipeline to run unit tests on every PR" "$(cat <<'EOF'
Story: INF.3 - CI/CD Pipeline Automation

## Context & Requirements

As a developer, I want unit tests to run automatically on every pull request
So that regressions are caught before code is merged.

## Acceptance Criteria

- [ ] Pipeline triggers on PR open and every push to the PR branch.
- [ ] Unit tests run for all services in parallel.
- [ ] PR is blocked from merging if any test fails.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.3.2 - Add integration test step to CI pipeline" "$(cat <<'EOF'
Story: INF.3 - CI/CD Pipeline Automation

## Context & Requirements

As a developer, I want integration tests run in CI using real service dependencies
So that cross-service interactions are validated before merging.

## Acceptance Criteria

- [ ] Integration tests run against Dockerized dependencies (Postgres, Kafka, Redis).
- [ ] Test results published as a CI artifact.
- [ ] Code coverage report generated; pipeline warns if coverage drops below 80%.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.3.3 - Configure auto-deploy to preprod on main branch merge" "$(cat <<'EOF'
Story: INF.3 - CI/CD Pipeline Automation

## Context & Requirements

As a developer, I want merges to main to automatically deploy to preprod
So that the latest code is always available for testing without manual steps.

## Acceptance Criteria

- [ ] Merge to `main` triggers build, image push, and rolling deploy to `preprod` namespace.
- [ ] Deploy uses rolling update strategy (zero downtime).
- [ ] CI reports deployment success or failure.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.3.4 - Add manual approval gate for production deployment" "$(cat <<'EOF'
Story: INF.3 - CI/CD Pipeline Automation

## Context & Requirements

As a DevOps engineer, I want production deployments to require manual approval
So that no unreviewed changes reach production automatically.

## Acceptance Criteria

- [ ] Production deploy step requires explicit approval from an authorized team member.
- [ ] Approval request notified via CI UI (and optionally Slack/email).
- [ ] Rejected or expired approvals are logged with reason.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: INF.4 - Docker Containerization ───────────────────────────────────

create_issue "INF.4.1 - Write multi-stage Dockerfiles for all Spring Boot services" "$(cat <<'EOF'
Story: INF.4 - Docker Containerization

## Context & Requirements

As a developer, I want each Spring Boot service packaged in an optimized Docker image
So that images are small and build artifacts are not included in the runtime image.

## Acceptance Criteria

- [ ] Multi-stage Dockerfile: build stage (Maven/Gradle + JDK), runtime stage (JRE only).
- [ ] Container runs as a non-root user.
- [ ] One Dockerfile per service: `auth`, `fetch_api`, `notification`, `recommendation`.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.4.2 - Write Dockerfile for Next.js frontend" "$(cat <<'EOF'
Story: INF.4 - Docker Containerization

## Context & Requirements

As a developer, I want the Next.js frontend packaged in a production Docker image
So that it can be deployed consistently alongside backend services.

## Acceptance Criteria

- [ ] Multi-stage Dockerfile: build stage (Bun + Node), runtime stage (standalone Next.js output).
- [ ] Container runs as a non-root user and exposes port 3000.
- [ ] Image size optimized (no dev dependencies in final stage).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.4.3 - Create Docker Compose for local development + configure CI image push" "$(cat <<'EOF'
Story: INF.4 - Docker Containerization

## Context & Requirements

As a developer, I want a single command to start the full stack locally
And images built and published automatically on CI success.

## Acceptance Criteria

- [ ] `docker-compose.yml` starts all services with their dependencies (Postgres, Kafka, Redis).
- [ ] CI builds and tags images with the commit SHA on merge to `main`.
- [ ] Images pushed to the container registry with both `sha-<hash>` and `latest` tags.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: INF.5 - Observability Stack ───────────────────────────────────────

create_issue "INF.5.1 - Deploy Grafana & configure service health dashboards" "$(cat <<'EOF'
Story: INF.5 - Observability Stack

## Context & Requirements

As a DevOps engineer, I want Grafana dashboards showing service health metrics
So that I can spot performance issues at a glance.

## Acceptance Criteria

- [ ] Grafana deployed with persistent storage.
- [ ] Dashboard panels: request rate, error rate, p99 latency — per service.
- [ ] Dashboards provisioned as code (JSON/YAML config, not manual UI).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.5.2 - Deploy Elasticstack & configure log ingestion from all services" "$(cat <<'EOF'
Story: INF.5 - Observability Stack

## Context & Requirements

As a DevOps engineer, I want all service logs centralized in Elasticstack
So that I can search and correlate logs across services when investigating issues.

## Acceptance Criteria

- [ ] Elasticsearch and Kibana deployed.
- [ ] All services ship structured logs to Elasticsearch via Filebeat or Logstash.
- [ ] Index pattern and default search configured in Kibana.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "INF.5.3 - Configure alerts for error rate & latency thresholds" "$(cat <<'EOF'
Story: INF.5 - Observability Stack

## Context & Requirements

As a DevOps engineer, I want automated alerts when system health degrades
So that issues are surfaced before users are impacted.

## Acceptance Criteria

- [ ] Alert fires when error rate exceeds 5% over a 5-minute window.
- [ ] Alert fires when p99 latency exceeds 2 seconds.
- [ ] Alerts delivered via configured channel (email or Slack webhook).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: MKT.1 - Game Key Purchase Flow ────────────────────────────────────

create_issue "MKT.1.1 - Create keys, orders, transactions DB schema" "$(cat <<'EOF'
Story: MKT.1 - Game Key Purchase Flow

## Context & Requirements

As a backend developer, I want a normalized schema for marketplace transactions
So that key ownership and order state are tracked reliably.

## Acceptance Criteria

- [ ] `keys` table: id, game_id, code, status (available/reserved/sold), seller_id.
- [ ] `orders` table: id, buyer_id, key_id, status, created_at.
- [ ] `transactions` table: id, order_id, amount, payment_method, created_at.
- [ ] Migrations are versioned and reversible.

## Data & Event Tasks

- [ ] Update DB Schema: Create `keys`, `orders`, `transactions` tables.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "MKT.1.2 - Implement atomic key reservation endpoint" "$(cat <<'EOF'
Story: MKT.1 - Game Key Purchase Flow

## Context & Requirements

As a user, I want a key held for me while I complete payment
So that two buyers cannot purchase the same key simultaneously.

## Acceptance Criteria

- [ ] `POST /orders/reserve` locks an available key using a DB transaction.
- [ ] Returns 409 Conflict if the key is already reserved or sold.
- [ ] Reservation expires after 10 minutes if payment is not completed (scheduled cleanup job).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Cache reservation expiry per order ID.
EOF
)"

create_issue "MKT.1.3 - Implement payment processing & key delivery endpoint" "$(cat <<'EOF'
Story: MKT.1 - Game Key Purchase Flow

## Context & Requirements

As a user, I want payment and key delivery to happen atomically
So that I never pay without receiving the key, or receive a key without being charged.

## Acceptance Criteria

- [ ] `POST /orders/:id/pay` processes payment and delivers the key code atomically.
- [ ] Key status updated to `sold` in the same DB transaction as payment record.
- [ ] Produces `order.created` and `key.sold` Kafka events on success.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `order.created`, `key.sold`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Invalidate key availability cache for the game.
EOF
)"

create_issue "MKT.1.4 - Build purchase history API + UI page" "$(cat <<'EOF'
Story: MKT.1 - Game Key Purchase Flow

## Context & Requirements

As a user, I want to view my past purchases
So that I can access delivered keys and track my spending.

## Acceptance Criteria

- [ ] `GET /orders` returns paginated order history for the authenticated user.
- [ ] Order detail view includes: game name, date, status, and delivered key code.
- [ ] Frontend page renders the order list and individual order detail.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: MKT.2 - Peer-to-Peer Resell System ────────────────────────────────

create_issue "MKT.2.1 - Create listings table & ownership transfer logic on keys" "$(cat <<'EOF'
Story: MKT.2 - Peer-to-Peer Resell System

## Context & Requirements

As a backend developer, I want a listings table and transfer logic
So that users can list keys they own and transfer ownership on sale.

## Acceptance Criteria

- [ ] `listings` table: id, key_id, seller_id, price, status (active/sold/cancelled).
- [ ] Ownership transfer atomically updates `keys.seller_id` on sale.
- [ ] Only the current key owner can create a listing (validated server-side).

## Data & Event Tasks

- [ ] Update DB Schema: Create `listings` table; add `seller_id` FK to `keys`.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "MKT.2.2 - Implement create/cancel listing API endpoints" "$(cat <<'EOF'
Story: MKT.2 - Peer-to-Peer Resell System

## Context & Requirements

As a user, I want to list my game keys for sale and cancel listings I no longer want
So that I can manage my resell activity.

## Acceptance Criteria

- [ ] `POST /listings` creates a listing for an owned key at a specified price.
- [ ] `DELETE /listings/:id` cancels an active listing (seller only).
- [ ] Produces `listing.created` Kafka event on successful creation.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `listing.created`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Cache active listings count per game.
EOF
)"

create_issue "MKT.2.3 - Implement escrow-based resell purchase flow" "$(cat <<'EOF'
Story: MKT.2 - Peer-to-Peer Resell System

## Context & Requirements

As a user, I want to buy a resell listing with a secure escrow mechanism
So that I only receive the key after payment is confirmed, and am refunded if transfer fails.

## Acceptance Criteria

- [ ] Buyer payment held in escrow until key delivery is confirmed.
- [ ] Key code revealed to buyer only after escrow release.
- [ ] Failed transfers automatically refund the buyer.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `resell.completed`
- [ ] Consume Kafka Events: `order.created` to initiate escrow.
- [ ] Update Redis state: N/A
EOF
)"

create_issue "MKT.2.4 - Notify seller via Kafka on transfer completion" "$(cat <<'EOF'
Story: MKT.2 - Peer-to-Peer Resell System

## Context & Requirements

As a seller, I want a notification when my listed key is sold
So that I know the transfer completed and payment was credited.

## Acceptance Criteria

- [ ] `resell.completed` Kafka event consumed by Notification service.
- [ ] Notification includes: game name, sale amount, buyer confirmation.
- [ ] Notification delivered via user's preferred channel (in-app/email).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `resell.completed`
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: MKT.3 - Gift Card Payment Integration ─────────────────────────────

create_issue "MKT.3.1 - Create wallet & gift_card_redemptions DB schema" "$(cat <<'EOF'
Story: MKT.3 - Gift Card Payment Integration

## Context & Requirements

As a backend developer, I want a wallet system to hold redeemed gift card balances
So that users can spend their balance on the marketplace.

## Acceptance Criteria

- [ ] `wallet` table: id, user_id, balance (decimal), updated_at.
- [ ] `gift_card_redemptions` table: id, user_id, card_type, amount, redeemed_at.
- [ ] Wallet balance updated atomically during redemption.

## Data & Event Tasks

- [ ] Update DB Schema: Create `wallet` and `gift_card_redemptions` tables.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Cache wallet balance per user.
EOF
)"

create_issue "MKT.3.2 - Implement Apple gift card validation & redemption API" "$(cat <<'EOF'
Story: MKT.3 - Gift Card Payment Integration

## Context & Requirements

As a user, I want to redeem an Apple gift card and add its balance to my wallet
So that I can use it to buy game keys.

## Acceptance Criteria

- [ ] `POST /wallet/redeem/apple` accepts a card code.
- [ ] Card validated via Apple's redemption API before crediting balance.
- [ ] Invalid or already-used cards return a clear error message.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `payment.gift_card_redeemed`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Update cached wallet balance.
EOF
)"

create_issue "MKT.3.3 - Implement Amazon gift card validation & redemption API" "$(cat <<'EOF'
Story: MKT.3 - Gift Card Payment Integration

## Context & Requirements

As a user, I want to redeem an Amazon gift card and add its balance to my wallet
So that I have an additional flexible payment option.

## Acceptance Criteria

- [ ] `POST /wallet/redeem/amazon` accepts a card code.
- [ ] Card validated via Amazon's API before crediting balance.
- [ ] Invalid or already-used cards return a clear error message.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `payment.gift_card_redeemed`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Update cached wallet balance.
EOF
)"

# ─── Story: MKT.4 - Shopping Cart & Order Tracking ────────────────────────────

create_issue "MKT.4.1 - Implement cart API with Redis persistence (TTL-based)" "$(cat <<'EOF'
Story: MKT.4 - Shopping Cart & Order Tracking

## Context & Requirements

As a user, I want my shopping cart to persist across browser sessions
So that I do not lose items when I close and reopen the site.

## Acceptance Criteria

- [ ] `POST /cart/items` adds a key to the cart stored in Redis (TTL: 24h).
- [ ] `DELETE /cart/items/:id` removes an item from the cart.
- [ ] `GET /cart` returns all current cart items with price and game details.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `cart.item_added`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Store cart as a Redis hash keyed by user ID.
EOF
)"

create_issue "MKT.4.2 - Add real-time stock availability check on cart items" "$(cat <<'EOF'
Story: MKT.4 - Shopping Cart & Order Tracking

## Context & Requirements

As a user, I want to know if a cart item goes out of stock before I checkout
So that I am not surprised by unavailability at payment time.

## Acceptance Criteria

- [ ] `GET /cart` validates availability of each item against current key status.
- [ ] Unavailable items flagged with `status: out_of_stock` in the response.
- [ ] Frontend warns the user and disables checkout if any item is unavailable.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `key.sold` to invalidate key availability in Redis.
- [ ] Update Redis state: Cache key availability counts per game.
EOF
)"

create_issue "MKT.4.3 - Implement order status tracking via Kafka events" "$(cat <<'EOF'
Story: MKT.4 - Shopping Cart & Order Tracking

## Context & Requirements

As a user, I want my order status to update automatically as the purchase progresses
So that I always know the current state without refreshing.

## Acceptance Criteria

- [ ] Order status transitions: `pending` → `processing` → `completed` / `failed`.
- [ ] Status updated by consuming `order.created` and `key.sold` events.
- [ ] `GET /orders/:id` returns the current status with timestamp of last update.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `order.created`, `key.sold`
- [ ] Update Redis state: N/A
EOF
)"

create_issue "MKT.4.4 - Build cart & order status UI components" "$(cat <<'EOF'
Story: MKT.4 - Shopping Cart & Order Tracking

## Context & Requirements

As a user, I want a clear cart view and real-time order status page in the frontend
So that I can manage my purchases with confidence.

## Acceptance Criteria

- [ ] Cart sidebar/page shows items with game name, price, and availability status.
- [ ] Checkout button disabled when cart contains out-of-stock items.
- [ ] Order status page auto-refreshes when status changes (polling or SSE).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: NOT.1 - Kafka Broker Setup ────────────────────────────────────────

create_issue "NOT.1.1 - Deploy Kafka broker in Docker/K8s" "$(cat <<'EOF'
Story: NOT.1 - Kafka Broker Setup

## Context & Requirements

As a backend developer, I want a running Kafka broker reachable by all services
So that asynchronous event-driven communication can be established.

## Acceptance Criteria

- [ ] Kafka broker deployed as Docker container (local) and K8s StatefulSet (cluster).
- [ ] KRaft or Zookeeper mode configured and stable.
- [ ] Broker endpoint reachable from all micro-service pods.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "NOT.1.2 - Define all domain event topics with schemas" "$(cat <<'EOF'
Story: NOT.1 - Kafka Broker Setup

## Context & Requirements

As a backend developer, I want all Kafka topics defined upfront with documented schemas
So that producers and consumers have a shared contract.

## Acceptance Criteria

- [ ] Topics created: `game.synced`, `game.updated`, `order.created`, `key.sold`, `listing.created`, `resell.completed`, `notification.sent`, `badge.awarded`, `steam.profile_linked`, `user.registered`, `user.logged_in`, `payment.gift_card_redeemed`.
- [ ] Each topic has a documented message schema (key/value format, field types).
- [ ] Retention policy configured per topic (default: 7 days).

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "NOT.1.3 - Configure ACLs for producer/consumer authorization" "$(cat <<'EOF'
Story: NOT.1 - Kafka Broker Setup

## Context & Requirements

As a DevOps engineer, I want Kafka access controlled per service
So that a service can only produce or consume from its authorized topics.

## Acceptance Criteria

- [ ] Each micro-service has a dedicated service account for Kafka authentication.
- [ ] Producers authorized only to write to their own topics.
- [ ] Consumers authorized only to read from their subscribed topics.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: NOT.2 - Price Drop Alert Service ──────────────────────────────────

create_issue "NOT.2.1 - Create subscriptions & notification_logs DB schema" "$(cat <<'EOF'
Story: NOT.2 - Price Drop Alert Service

## Context & Requirements

As a backend developer, I want a schema to store user subscriptions and sent notifications
So that alert history and targets are persisted.

## Acceptance Criteria

- [ ] `subscriptions` table: id, user_id, type (game/category), target_id, created_at.
- [ ] `notification_logs` table: id, user_id, type, message, sent_at.
- [ ] Indexes on `user_id` for efficient lookup.

## Data & Event Tasks

- [ ] Update DB Schema: Create `subscriptions` and `notification_logs` tables.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Cache user subscription lists.
EOF
)"

create_issue "NOT.2.2 - Implement game/category follow & unfollow API" "$(cat <<'EOF'
Story: NOT.2 - Price Drop Alert Service

## Context & Requirements

As a user, I want to follow and unfollow specific games and categories
So that I only receive alerts for content I care about.

## Acceptance Criteria

- [ ] `POST /subscriptions` creates a game or category subscription for the authenticated user.
- [ ] `DELETE /subscriptions/:id` removes a subscription.
- [ ] `GET /subscriptions` lists all active subscriptions for the authenticated user.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Invalidate subscription cache on change.
EOF
)"

create_issue "NOT.2.3 - Implement price-drop detection Kafka consumer" "$(cat <<'EOF'
Story: NOT.2 - Price Drop Alert Service

## Context & Requirements

As a backend developer, I want a consumer that detects price drops for followed games
So that users are alerted when a listing appears at a lower price.

## Acceptance Criteria

- [ ] Consumes `listing.created` events.
- [ ] Compares listing price against the lowest known price for that game.
- [ ] Triggers notification dispatch for all users subscribed to that game.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `listing.created`
- [ ] Update Redis state: Cache lowest known price per game.
EOF
)"

create_issue "NOT.2.4 - Implement notification dispatch with per-user preference" "$(cat <<'EOF'
Story: NOT.2 - Price Drop Alert Service

## Context & Requirements

As a user, I want notifications delivered via my preferred channel
So that I receive alerts where I am most likely to see them.

## Acceptance Criteria

- [ ] User notification preferences stored: in-app and/or email.
- [ ] Dispatch service routes to the correct channel(s) per user.
- [ ] Produces `notification.sent` Kafka event after each dispatch.

## Data & Event Tasks

- [ ] Update DB Schema: Add `notification_preferences` column to `users`.
- [ ] Produce Kafka Events: `notification.sent`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

# ─── Story: NOT.3 - Real-time Frontend Notifications ──────────────────────────

create_issue "NOT.3.1 - Create notifications table with read/unread status" "$(cat <<'EOF'
Story: NOT.3 - Real-time Frontend Notifications

## Context & Requirements

As a backend developer, I want sent notifications persisted with read status
So that users can see their full notification history and mark items as read.

## Acceptance Criteria

- [ ] `notifications` table: id, user_id, message, is_read (default false), created_at.
- [ ] Table populated by consuming `notification.sent` events.
- [ ] Composite index on `(user_id, is_read)` for fast unread queries.

## Data & Event Tasks

- [ ] Update DB Schema: Create `notifications` table.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `notification.sent`
- [ ] Update Redis state: Cache unread count per user.
EOF
)"

create_issue "NOT.3.2 - Implement SSE/WebSocket notification stream endpoint" "$(cat <<'EOF'
Story: NOT.3 - Real-time Frontend Notifications

## Context & Requirements

As a backend developer, I want a server-push endpoint that streams new notifications to the frontend
So that the UI updates without polling.

## Acceptance Criteria

- [ ] `GET /notifications/stream` opens an SSE connection for the authenticated user.
- [ ] New notification payloads pushed in real time as they are stored.
- [ ] Connection closes gracefully on client disconnect.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "NOT.3.3 - Build notification bell component with unread count in Next.js" "$(cat <<'EOF'
Story: NOT.3 - Real-time Frontend Notifications

## Context & Requirements

As a user, I want a notification bell in the header showing how many unread notifications I have
So that I can tell at a glance when something new has happened.

## Acceptance Criteria

- [ ] Bell icon in the header displays an unread count badge.
- [ ] Clicking the bell opens a dropdown with the 10 most recent notifications.
- [ ] Unread count fetched on page load and updated live via the SSE stream.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "NOT.3.4 - Mark notifications as read on user interaction" "$(cat <<'EOF'
Story: NOT.3 - Real-time Frontend Notifications

## Context & Requirements

As a user, I want notifications marked as read when I interact with them
So that the unread count accurately reflects unseen notifications.

## Acceptance Criteria

- [ ] `PATCH /notifications/:id/read` marks a single notification as read.
- [ ] `PATCH /notifications/read-all` marks all notifications as read.
- [ ] Bell badge count updates immediately in the UI after the action.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Update cached unread count for the user.
EOF
)"

# ─── Story: UX.1 - Authentication Service ─────────────────────────────────────

create_issue "UX.1.1 - Implement user registration endpoint with email validation" "$(cat <<'EOF'
Story: UX.1 - Authentication Service

## Context & Requirements

As a user, I want to create an account with my email and password
So that I can access the platform.

## Acceptance Criteria

- [ ] `POST /auth/register` accepts email, password, and username.
- [ ] Email uniqueness enforced; duplicate returns 409.
- [ ] Password hashed with bcrypt before storage.
- [ ] Produces `user.registered` Kafka event on success.

## Data & Event Tasks

- [ ] Update DB Schema: Create `users` table.
- [ ] Produce Kafka Events: `user.registered`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.1.2 - Implement login endpoint with JWT & refresh token issuance" "$(cat <<'EOF'
Story: UX.1 - Authentication Service

## Context & Requirements

As a user, I want to log in and receive tokens so I can make authenticated requests
So that my session is secure and stateless.

## Acceptance Criteria

- [ ] `POST /auth/login` validates credentials and returns access token + refresh token.
- [ ] Access token TTL: 15 minutes; refresh token TTL: 7 days.
- [ ] Produces `user.logged_in` Kafka event on success.

## Data & Event Tasks

- [ ] Update DB Schema: Create `refresh_tokens` table.
- [ ] Produce Kafka Events: `user.logged_in`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Store active session reference.
EOF
)"

create_issue "UX.1.3 - Implement token refresh & logout endpoints" "$(cat <<'EOF'
Story: UX.1 - Authentication Service

## Context & Requirements

As a user, I want to silently refresh my session and securely log out
So that my experience is seamless and my session is properly terminated.

## Acceptance Criteria

- [ ] `POST /auth/refresh` issues a new access token from a valid refresh token.
- [ ] `POST /auth/logout` invalidates the refresh token in Redis.
- [ ] Revoked tokens are rejected on subsequent refresh attempts.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Store and invalidate refresh tokens.
EOF
)"

create_issue "UX.1.4 - Implement password reset via email flow" "$(cat <<'EOF'
Story: UX.1 - Authentication Service

## Context & Requirements

As a user, I want to reset my forgotten password via a link sent to my email
So that I can regain access to my account.

## Acceptance Criteria

- [ ] `POST /auth/forgot-password` sends a reset link to the user's email.
- [ ] Reset token is single-use and expires after 1 hour.
- [ ] `POST /auth/reset-password` validates the token and updates the password.

## Data & Event Tasks

- [ ] Update DB Schema: Create `password_reset_tokens` table.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.1.5 - Add account lockout after N failed login attempts" "$(cat <<'EOF'
Story: UX.1 - Authentication Service

## Context & Requirements

As a security engineer, I want accounts to lock after repeated failed logins
So that brute-force attacks are mitigated.

## Acceptance Criteria

- [ ] Failed login attempts tracked in Redis per user (TTL: 15 minutes).
- [ ] Account locked after 5 consecutive failures.
- [ ] Locked account returns 423 with remaining lockout duration in the response.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Store failed attempt counter and lockout flag per user.
EOF
)"

# ─── Story: UX.2 - Steam API Integration ──────────────────────────────────────

create_issue "UX.2.1 - Implement Steam OAuth connection & callback flow" "$(cat <<'EOF'
Story: UX.2 - Steam API Integration

## Context & Requirements

As a user, I want to link my Steam account using OAuth
So that my Steam identity is verified and connected to my platform profile.

## Acceptance Criteria

- [ ] `GET /auth/steam/connect` redirects the user to Steam OpenID.
- [ ] Callback handler verifies the Steam response signature.
- [ ] Steam ID stored in `steam_profiles` table linked to the user.

## Data & Event Tasks

- [ ] Update DB Schema: Create `steam_profiles` table.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.2.2 - Fetch & store user's Steam game library" "$(cat <<'EOF'
Story: UX.2 - Steam API Integration

## Context & Requirements

As a platform, I want to import the user's Steam library after they connect their account
So that it can be used to power personalized recommendations.

## Acceptance Criteria

- [ ] Fetches owned games from the Steam Web API (GetOwnedGames endpoint).
- [ ] Stores app_id and name in `steam_game_library` table.
- [ ] Produces `steam.profile_linked` Kafka event after library import completes.

## Data & Event Tasks

- [ ] Update DB Schema: Create `steam_game_library` table.
- [ ] Produce Kafka Events: `steam.profile_linked`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Cache Steam library game IDs per user.
EOF
)"

create_issue "UX.2.3 - Schedule periodic Steam library refresh" "$(cat <<'EOF'
Story: UX.2 - Steam API Integration

## Context & Requirements

As a platform, I want the Steam library kept up to date automatically
So that newly purchased games appear in recommendations without user action.

## Acceptance Criteria

- [ ] Scheduled job refreshes Steam library for all linked accounts daily.
- [ ] Only adds new games; does not remove existing entries.
- [ ] Per-user errors are logged without aborting the full refresh run.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `steam.profile_linked` (on refresh with new games)
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Update cached library on refresh.
EOF
)"

create_issue "UX.2.4 - Add Steam account unlink endpoint" "$(cat <<'EOF'
Story: UX.2 - Steam API Integration

## Context & Requirements

As a user, I want to remove my Steam account link at any time
So that I have control over my data.

## Acceptance Criteria

- [ ] `DELETE /auth/steam/disconnect` removes the Steam profile and library data.
- [ ] User's recommendation scores are recalculated after unlinking.
- [ ] Endpoint returns 404 if no Steam account is linked.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: Clear cached Steam library for the user.
EOF
)"

# ─── Story: UX.3 - Game Recommendation Engine ─────────────────────────────────

create_issue "UX.3.1 - Create recommendation_scores DB schema" "$(cat <<'EOF'
Story: UX.3 - Game Recommendation Engine

## Context & Requirements

As a backend developer, I want a schema to store recommendation scores per user and game
So that personalized and trending recommendations can be persisted and queried efficiently.

## Acceptance Criteria

- [ ] `recommendation_scores` table: id, user_id (nullable), game_id, score, updated_at.
- [ ] Null `user_id` represents global trending scores.
- [ ] Composite index on `(user_id, score DESC)` for fast top-N queries.

## Data & Event Tasks

- [ ] Update DB Schema: Create `recommendation_scores` table.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.3.2 - Implement trending games algorithm (time-weighted purchase/view volume)" "$(cat <<'EOF'
Story: UX.3 - Game Recommendation Engine

## Context & Requirements

As a user, I want to see which games are currently popular on the platform
So that I can discover what others are playing.

## Acceptance Criteria

- [ ] Consumes `order.created` events to increment game score.
- [ ] Scores decay over time (time-weighted: recent events count more).
- [ ] Top 20 trending games recomputed and cached in Redis every hour.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `order.created`
- [ ] Update Redis state: Cache top 20 trending games (TTL: 1 hour).
EOF
)"

create_issue "UX.3.3 - Implement personalized recommendation engine (Steam + purchase history)" "$(cat <<'EOF'
Story: UX.3 - Game Recommendation Engine

## Context & Requirements

As a user, I want recommendations tailored to my gaming history
So that I discover games I am likely to enjoy.

## Acceptance Criteria

- [ ] Consumes `steam.profile_linked` and `order.created` to build a user taste profile.
- [ ] Scores catalog games by genre/platform overlap with the user's history.
- [ ] Scores stored in `recommendation_scores` per user.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `steam.profile_linked`, `order.created`
- [ ] Update Redis state: Invalidate user recommendation cache on score update.
EOF
)"

create_issue "UX.3.4 - Expose recommendations REST API endpoint" "$(cat <<'EOF'
Story: UX.3 - Game Recommendation Engine

## Context & Requirements

As a frontend developer, I want a REST API to fetch trending and personalized recommendations
So that the frontend can display them without embedding algorithm logic.

## Acceptance Criteria

- [ ] `GET /recommendations/trending` returns top 20 trending games with metadata.
- [ ] `GET /recommendations/personal` returns top 20 personalized games for the authenticated user.
- [ ] Both endpoints documented in Swagger.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.3.5 - Cache recommendations per user in Redis (TTL-based)" "$(cat <<'EOF'
Story: UX.3 - Game Recommendation Engine

## Context & Requirements

As a backend developer, I want recommendation results cached per user
So that the recommendation endpoint is fast without recalculating on every request.

## Acceptance Criteria

- [ ] Personalized results cached per `user_id` with a 1-hour TTL.
- [ ] Cache invalidated when `order.created` or `steam.profile_linked` is received for that user.
- [ ] Cache miss falls back to a live DB query without error.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `order.created`, `steam.profile_linked`
- [ ] Update Redis state: Store recommendations per user with TTL.
EOF
)"

# ─── Story: UX.4 - Gamification & Seniority Badges ───────────────────────────

create_issue "UX.4.1 - Create badges & user_badges DB schema" "$(cat <<'EOF'
Story: UX.4 - Gamification & Seniority Badges

## Context & Requirements

As a backend developer, I want a schema to define available badges and track which users have earned them
So that badge data is persisted and queryable.

## Acceptance Criteria

- [ ] `badges` table: id, name, description, icon_url, criteria_type, criteria_value.
- [ ] `user_badges` table: id, user_id, badge_id, awarded_at.
- [ ] Unique constraint on `(user_id, badge_id)` to prevent duplicate awards.

## Data & Event Tasks

- [ ] Update DB Schema: Create `badges` and `user_badges` tables.
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.4.2 - Implement badge rules engine (evaluate criteria on domain events)" "$(cat <<'EOF'
Story: UX.4 - Gamification & Seniority Badges

## Context & Requirements

As a backend developer, I want a rules engine that checks badge criteria against incoming events
So that badges are awarded automatically without hardcoded logic per badge.

## Acceptance Criteria

- [ ] Rules engine evaluates criteria types: `account_age_days`, `order_count`, `listing_count`.
- [ ] New badges can be added by inserting a row in `badges` without code changes.
- [ ] Engine runs on incoming domain events and awards badge if criteria are met.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `badge.awarded`
- [ ] Consume Kafka Events: N/A
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.4.3 - Consume user.registered & order.created events for badge evaluation" "$(cat <<'EOF'
Story: UX.4 - Gamification & Seniority Badges

## Context & Requirements

As a backend developer, I want badge evaluation triggered by relevant domain events
So that badges are awarded in real time as users reach milestones.

## Acceptance Criteria

- [ ] Consumes `user.registered` to start tracking account age for seniority badges.
- [ ] Consumes `order.created` to check and update purchase count badges.
- [ ] Produces `badge.awarded` event when a new badge is earned.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: `badge.awarded`
- [ ] Consume Kafka Events: `user.registered`, `order.created`
- [ ] Update Redis state: N/A
EOF
)"

create_issue "UX.4.4 - Display earned badges on user profile page" "$(cat <<'EOF'
Story: UX.4 - Gamification & Seniority Badges

## Context & Requirements

As a user, I want to see my earned badges displayed on my profile
So that I can show my platform seniority and achievements.

## Acceptance Criteria

- [ ] `GET /users/:id/badges` returns all earned badges with name, icon, and awarded date.
- [ ] Profile page displays badge icons in a grid with tooltip on hover.
- [ ] Earning a new badge triggers an in-app notification.

## Data & Event Tasks

- [ ] Update DB Schema: N/A
- [ ] Produce Kafka Events: N/A
- [ ] Consume Kafka Events: `badge.awarded` (to trigger in-app notification)
- [ ] Update Redis state: N/A
EOF
)"
