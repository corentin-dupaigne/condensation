# GET /balance

Get a user's current balance.

**Query params:**
- `userid` (integer, required)

**Response 200:**
```json
{ "balance": 1500 }
```

Note: balance is in cents (e.g. 1500 = €15.00).
