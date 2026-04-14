# GET /games

Paginated game catalog with optional filters.

**Query params:**
- `page` (integer, default 0)
- `size` (integer, default 20)
- `search` (string) — full-text search
- `genreId` (integer)

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "steamAppId": 12345,
      "name": "Game Name",
      "slug": "game-name",
      "headerImage": "https://...",
      "priceFinal": 999,
      "reductionPercentage": 10,
      "recommendationsTotal": 5000,
      "releaseDate": "2024-01-15",
      "genres": [{ "id": 1, "description": "Action" }]
    }
  ],
  "totalElements": 100,
  "totalPages": 5
}
```
