#!/usr/bin/env bash
# Creates GitHub user story issues for each epic.
# Usage: ./create-stories.sh [--repo owner/repo] [--label story]
# Requires: gh CLI authenticated (gh auth login)

set -euo pipefail

LABEL="story"
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
  echo "Creating issue: Story: $title"
  # shellcheck disable=SC2086
  gh issue create \
    $REPO_FLAG \
    --title "Story: $title" \
    --body "$body" \
    --label "$LABEL"
  echo "Done: Story: $title"
}

# ─── Epic: Catalog Data ────────────────────────────────────────────────────────

create_issue "CAT.1 - IGDB Data Synchronization" "$(cat <<'EOF'
## Context & Requirements

As a platform admin, I want the Fetch_api service to automatically sync game data from IGDB
So that the catalog stays current without manual intervention.

## Acceptance Criteria

- [ ] Fetch_api service authenticates and connects to the IGDB API.
- [ ] Game data (title, genre, platform, cover, description) is retrieved and stored in PostgreSQL.
- [ ] Synchronization runs on a configurable schedule (e.g., nightly cron).
- [ ] Failed syncs are retried and logged with details.

## Tasks

- [ ] CAT.1.1: Set up IGDB API credentials & auth client
- [ ] CAT.1.2: Implement game data fetch (title, genre, platform, cover, rating)
- [ ] CAT.1.3: Create scheduled sync job with configurable interval
- [ ] CAT.1.4: Add retry logic & structured error logging for failed syncs
EOF
)"

create_issue "CAT.2 - Game Search & Filtering API" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to search games using multi-criteria filters and sorting options
So that I can quickly find specific games matching my preferences.

## Acceptance Criteria

- [ ] Search supports free-text query combined with filters: genre, platform, price range, release year.
- [ ] Results support multiple sort options: relevance, price, rating, release date.
- [ ] Search API response time is under 500ms under normal load.
- [ ] Pagination is supported on search results.

## Tasks

- [ ] CAT.2.1: Add full-text search & filter indexes to `games` table
- [ ] CAT.2.2: Implement search endpoint with text query + filter params
- [ ] CAT.2.3: Add sorting & pagination to search results
- [ ] CAT.2.4: Cache frequent search queries in Redis
EOF
)"

create_issue "CAT.3 - Swagger API Documentation" "$(cat <<'EOF'
## Context & Requirements

As a developer, I want all backend endpoints documented via Swagger/OpenAPI
So that I can integrate with the API without ambiguity.

## Acceptance Criteria

- [ ] All REST endpoints are annotated with OpenAPI specifications.
- [ ] Swagger UI is accessible at `/api/docs`.
- [ ] Request/response schemas are documented with field descriptions and examples.
- [ ] Authentication requirements are documented per endpoint.

## Tasks

- [ ] CAT.3.1: Annotate catalog endpoints with OpenAPI specs
- [ ] CAT.3.2: Annotate auth/user endpoints with OpenAPI specs
- [ ] CAT.3.3: Configure and expose Swagger UI at `/api/docs`
EOF
)"

# ─── Epic: Infrastructure ──────────────────────────────────────────────────────

create_issue "INF.1 - IaC with Terraform & Ansible" "$(cat <<'EOF'
## Context & Requirements

As a DevOps engineer, I want infrastructure provisioned via Terraform and configured via Ansible
So that environment setup is reproducible, automated, and version-controlled.

## Acceptance Criteria

- [ ] Terraform modules provision all required cloud resources (VMs, networking, storage).
- [ ] Ansible playbooks configure OS-level dependencies on provisioned machines.
- [ ] Terraform state is stored remotely (e.g., S3-compatible backend).
- [ ] Infrastructure can be torn down and reprovisioned from scratch with a single command.

## Tasks

- [ ] INF.1.1: Write Terraform module for networking (VPC, subnets)
- [ ] INF.1.2: Write Terraform module for compute resources
- [ ] INF.1.3: Configure remote Terraform state backend
- [ ] INF.1.4: Write Ansible playbooks for OS-level dependencies
EOF
)"

create_issue "INF.2 - Kubernetes Orchestration" "$(cat <<'EOF'
## Context & Requirements

As a DevOps engineer, I want all micro-services deployed on a Kubernetes cluster
So that services scale reliably and are managed centrally.

## Acceptance Criteria

- [ ] K8s manifests (Deployments, Services, ConfigMaps) defined for all micro-services.
- [ ] Horizontal Pod Autoscaling configured per service.
- [ ] Namespace isolation per environment (preprod / prod).

## Tasks

- [ ] INF.2.1: Write K8s Deployment & Service manifests for each micro-service
- [ ] INF.2.2: Configure ConfigMaps & Secrets for environment variables
- [ ] INF.2.3: Set up HPA for critical services
- [ ] INF.2.4: Create preprod & prod namespaces with RBAC
EOF
)"

create_issue "INF.3 - CI/CD Pipeline Automation" "$(cat <<'EOF'
## Context & Requirements

As a developer, I want automated CI/CD pipelines for preprod and prod environments
So that code changes are tested and deployed consistently.

## Acceptance Criteria

- [ ] Pipeline runs unit and integration tests on every pull request.
- [ ] Successful merges to main auto-deploy to preprod.
- [ ] A manual approval gate triggers production deployment.
- [ ] Pipeline coverage target is 80%+.

## Tasks

- [ ] INF.3.1: Set up CI pipeline to run unit tests on every PR
- [ ] INF.3.2: Add integration test step to CI pipeline
- [ ] INF.3.3: Configure auto-deploy to preprod on main branch merge
- [ ] INF.3.4: Add manual approval gate for production deployment
EOF
)"

create_issue "INF.4 - Docker Containerization" "$(cat <<'EOF'
## Context & Requirements

As a developer, I want all micro-services containerized via Docker
So that they run consistently across all environments.

## Acceptance Criteria

- [ ] Each micro-service has a production-ready, multi-stage Dockerfile.
- [ ] A Docker Compose file is available for local development.
- [ ] Images are published to a container registry on CI success.

## Tasks

- [ ] INF.4.1: Write multi-stage Dockerfiles for all Spring Boot services
- [ ] INF.4.2: Write Dockerfile for Next.js frontend
- [ ] INF.4.3: Create Docker Compose for local development + configure CI image push
EOF
)"

create_issue "INF.5 - Observability Stack" "$(cat <<'EOF'
## Context & Requirements

As a DevOps engineer, I want a full observability stack with Grafana and Elasticstack
So that I can monitor system health and investigate issues from centralized logs.

## Acceptance Criteria

- [ ] Grafana dashboards display service health metrics (CPU, memory, request latency).
- [ ] Elasticstack aggregates and indexes logs from all micro-services.
- [ ] Alerts configured for critical thresholds (error rate spikes, high latency).

## Tasks

- [ ] INF.5.1: Deploy Grafana & configure service health dashboards
- [ ] INF.5.2: Deploy Elasticstack & configure log ingestion from all services
- [ ] INF.5.3: Configure alerts for error rate & latency thresholds
EOF
)"

# ─── Epic: Marketplace ─────────────────────────────────────────────────────────

create_issue "MKT.1 - Game Key Purchase Flow" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to browse and purchase game keys from the marketplace
So that I can acquire games at competitive prices.

## Acceptance Criteria

- [ ] Users can view available keys for any game in the catalog.
- [ ] Purchase completes atomically: key reserved → payment → key delivered.
- [ ] Purchase history is accessible from the user account page.

## Tasks

- [ ] MKT.1.1: Create `keys`, `orders`, `transactions` DB schema
- [ ] MKT.1.2: Implement atomic key reservation endpoint
- [ ] MKT.1.3: Implement payment processing & key delivery endpoint
- [ ] MKT.1.4: Build purchase history API + UI page
EOF
)"

create_issue "MKT.2 - Peer-to-Peer Resell System" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to list my game keys for resale and buy keys from other users
So that I can trade digital items directly on the platform.

## Acceptance Criteria

- [ ] Users can list owned keys at a custom price.
- [ ] Purchase uses escrow mechanics to ensure a secure transfer.
- [ ] Seller receives a payment notification after the transfer completes.

## Tasks

- [ ] MKT.2.1: Create `listings` table & ownership transfer logic on `keys`
- [ ] MKT.2.2: Implement create/cancel listing API endpoints
- [ ] MKT.2.3: Implement escrow-based resell purchase flow
- [ ] MKT.2.4: Notify seller via Kafka on transfer completion
EOF
)"

create_issue "MKT.3 - Gift Card Payment Integration" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to pay using Apple or Amazon gift cards
So that I have flexible payment options beyond standard methods.

## Acceptance Criteria

- [ ] Gift card balance can be redeemed and added to a platform wallet.
- [ ] Apple and Amazon gift card redemption flows are fully implemented.
- [ ] Failed redemptions surface clear, actionable error messages.

## Tasks

- [ ] MKT.3.1: Create `wallet` & `gift_card_redemptions` DB schema
- [ ] MKT.3.2: Implement Apple gift card validation & redemption API
- [ ] MKT.3.3: Implement Amazon gift card validation & redemption API
EOF
)"

create_issue "MKT.4 - Shopping Cart & Order Tracking" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to manage a shopping cart and track my orders in real time
So that I have full visibility of my purchases before and after checkout.

## Acceptance Criteria

- [ ] Cart persists across sessions.
- [ ] Cart reflects real-time key availability.
- [ ] Order status updates in real time: pending → processing → complete.

## Tasks

- [ ] MKT.4.1: Implement cart API with Redis persistence (TTL-based)
- [ ] MKT.4.2: Add real-time stock availability check on cart items
- [ ] MKT.4.3: Implement order status tracking via Kafka events
- [ ] MKT.4.4: Build cart & order status UI components
EOF
)"

# ─── Epic: Notifications ───────────────────────────────────────────────────────

create_issue "NOT.1 - Kafka Broker Setup" "$(cat <<'EOF'
## Context & Requirements

As a backend developer, I want a Kafka broker routing messages between micro-services
So that services communicate asynchronously and reliably without tight coupling.

## Acceptance Criteria

- [ ] Kafka broker is deployed and reachable by all micro-services.
- [ ] Topics are defined per domain event type.
- [ ] Message queues are secured against unauthorized producers/consumers.

## Tasks

- [ ] NOT.1.1: Deploy Kafka broker in Docker/K8s
- [ ] NOT.1.2: Define all domain event topics with schemas
- [ ] NOT.1.3: Configure ACLs for producer/consumer authorization
EOF
)"

create_issue "NOT.2 - Price Drop Alert Service" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to receive alerts when a tracked game's price drops or new items appear in followed categories
So that I never miss a deal.

## Acceptance Criteria

- [ ] Users can follow specific games and categories.
- [ ] Notification service triggers alerts within 5 minutes of a qualifying price change.
- [ ] Notification preferences (in-app, email) are configurable per user.

## Tasks

- [ ] NOT.2.1: Create `subscriptions` & `notification_logs` DB schema
- [ ] NOT.2.2: Implement game/category follow & unfollow API
- [ ] NOT.2.3: Implement price-drop detection Kafka consumer
- [ ] NOT.2.4: Implement notification dispatch with per-user preference (in-app/email)
EOF
)"

create_issue "NOT.3 - Real-time Frontend Notifications" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to see real-time notifications in the frontend interface
So that I am immediately aware of relevant updates without manually refreshing.

## Acceptance Criteria

- [ ] Frontend connects to a notification stream (WebSocket or SSE).
- [ ] Unread notification count is displayed in the header.
- [ ] Notifications are marked as read on user interaction.

## Tasks

- [ ] NOT.3.1: Create `notifications` table with read/unread status
- [ ] NOT.3.2: Implement SSE/WebSocket notification stream endpoint
- [ ] NOT.3.3: Build notification bell component with unread count in Next.js
- [ ] NOT.3.4: Mark notifications as read on user interaction
EOF
)"

# ─── Epic: User Experience ─────────────────────────────────────────────────────

create_issue "UX.1 - Authentication Service" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to securely register, log in, and manage my account
So that my data and purchases are protected.

## Acceptance Criteria

- [ ] JWT-based authentication with refresh tokens is implemented.
- [ ] Password reset flow is available via email.
- [ ] Account is locked after repeated failed login attempts.

## Tasks

- [ ] UX.1.1: Implement user registration endpoint with email validation
- [ ] UX.1.2: Implement login endpoint with JWT & refresh token issuance
- [ ] UX.1.3: Implement token refresh & logout endpoints
- [ ] UX.1.4: Implement password reset via email flow
- [ ] UX.1.5: Add account lockout after N failed login attempts
EOF
)"

create_issue "UX.2 - Steam API Integration" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to link my Steam account to my profile
So that my game library and Steam activity inform my recommendations.

## Acceptance Criteria

- [ ] OAuth flow allows users to connect their Steam account.
- [ ] Steam game library is fetched and stored for use by the recommendation engine.
- [ ] Users can unlink their Steam account at any time.

## Tasks

- [ ] UX.2.1: Implement Steam OAuth connection & callback flow
- [ ] UX.2.2: Fetch & store user's Steam game library
- [ ] UX.2.3: Schedule periodic Steam library refresh
- [ ] UX.2.4: Add Steam account unlink endpoint
EOF
)"

create_issue "UX.3 - Game Recommendation Engine" "$(cat <<'EOF'
## Context & Requirements

As a user, I want personalized and trending game recommendations on the platform
So that I discover new games aligned with my tastes.

## Acceptance Criteria

- [ ] Trending games section reflects recent purchase and view volume.
- [ ] Personalized recommendations leverage Steam library and purchase history.
- [ ] Recommendation engine exposes results via a REST API consumed by the frontend.

## Tasks

- [ ] UX.3.1: Create `recommendation_scores` DB schema
- [ ] UX.3.2: Implement trending games algorithm (purchase/view volume, time-weighted)
- [ ] UX.3.3: Implement personalized recommendation engine (Steam library + purchase history)
- [ ] UX.3.4: Expose recommendations REST API endpoint
- [ ] UX.3.5: Cache recommendations per user in Redis (TTL-based)
EOF
)"

create_issue "UX.4 - Gamification & Seniority Badges" "$(cat <<'EOF'
## Context & Requirements

As a user, I want to earn badges based on my platform activity and seniority
So that I feel recognized and engaged with the platform.

## Acceptance Criteria

- [ ] Badge rules are defined (e.g., account age milestones, purchase count thresholds).
- [ ] Earned badges are displayed on the user profile.
- [ ] Badge award triggers an in-app notification.

## Tasks

- [ ] UX.4.1: Create `badges` & `user_badges` DB schema
- [ ] UX.4.2: Implement badge rules engine (evaluate criteria on domain events)
- [ ] UX.4.3: Consume `user.registered` & `order.created` events for badge evaluation
- [ ] UX.4.4: Display earned badges on user profile page
EOF
)"
