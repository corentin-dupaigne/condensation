# GET /feature

Homepage featured game lists (paginated). Returns topsellers, new releases, deals by price bracket, and upcoming games.

**Query params:**
- `page` (integer, default 0)
- `size` (integer, default 20) — items per category per page

**Response 200:**
```json
{
  "topseller": {
    "content": [GameSummary],
    "totalElements": 50,
    "totalPages": 3
  },
  "new_release": {
    "content": [GameSummary],
    "totalElements": 30,
    "totalPages": 2
  },
  "low_deals": {
    "under_5": { "content": [GameSummary], "totalElements": 10, "totalPages": 1 },
    "under_10": { "content": [GameSummary], "totalElements": 25, "totalPages": 2 },
    "under_20": { "content": [GameSummary], "totalElements": 40, "totalPages": 2 }
  },
  "upcoming": {
    "content": [GameSummary],
    "totalElements": 15,
    "totalPages": 1
  }
}
```

`GameSummary` shape:
```json
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
```
