# POST /orders

Create a new order for a user.

**Request body:**
```json
{
  "userid": 1,
  "games": [
    { "game_ids": 123, "quantity": 2 }
  ]
}
```

**Response 200:**
```json
{
  "error": "insufficient_balance",
  "message": "Not enough balance to complete the order."
}
```

Note: on success, `error` is empty/null and `message` confirms the order.
