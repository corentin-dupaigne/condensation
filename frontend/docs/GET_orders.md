# GET /orders

Get all orders for a user.

**Query params:**
- `userid` (integer, required)

**Response 200:**
```json
{
  "orders": [
    {
      "id": 1,
      "userId": 42,
      "gamesId": 123,
      "key": "XXXX-YYYY-ZZZZ",
      "game": {
        "name": "Elden Ring",
        "headerImage": "https://cdn.example.com/header.jpg",
        "genres": ["Action RPG", "Open World"]
      }
    }
  ]
}
```
