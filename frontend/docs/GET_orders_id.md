# GET /orders/{id}

Get a specific order by ID for a user.

**Path params:**
- `id` (integer, required)

**Query params:**
- `userid` (integer, required)

**Response 200:**
```json
{
  "order": {
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
}
```
