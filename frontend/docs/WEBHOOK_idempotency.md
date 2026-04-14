# Webhook Idempotency — POST /balance

## Problem

Stripe may deliver the same `payment_intent.succeeded` event more than once (network retries, dashboard resends). If `POST /balance` is called multiple times for the same PaymentIntent, the user's balance will be credited multiple times.

## Required Backend Behavior

The backend must deduplicate `POST /balance` calls by `payment_intent_id`.

**Suggested approach:** store processed PaymentIntent IDs in a table (e.g. `stripe_events`) and reject duplicates.

**Suggested request body change:**
```json
{
  "userid": 1,
  "amount": 1000,
  "payment_intent_id": "pi_3ABC..."
}
```

On duplicate `payment_intent_id`, return `200` (not `4xx`) so Stripe stops retrying.

## Frontend Behavior

The Next.js webhook handler (`/api/stripe/webhook`) passes `payment_intent_id` in the `POST /balance` body. No other changes needed on the frontend side.

## Reference

- [Stripe docs — Handle webhook events](https://stripe.com/docs/webhooks#handle-duplicate-events)
