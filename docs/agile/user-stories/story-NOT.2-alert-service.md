# Story: NOT.2 - Price Drop Alert Service

## Context & Requirements

As a user, I want to receive alerts when a tracked game's price drops or new items appear in followed categories
So that I never miss a deal.

## Tasks

- [ ] NOT.2.1: Create `subscriptions` & `notification_logs` DB schema
- [ ] NOT.2.2: Implement game/category follow & unfollow API
- [ ] NOT.2.3: Implement price-drop detection Kafka consumer
- [ ] NOT.2.4: Implement notification dispatch with per-user preference (in-app/email)
