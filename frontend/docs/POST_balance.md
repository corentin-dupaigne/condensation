# POST /balance

Modify a user's balance.

**Request body:**
```json
{ "userid": 1, "amount": 500 }
```

Note: `amount` is in cents. Can be positive (add) or negative (deduct).

**Response 200:**
```json
{ "success": true }
```
