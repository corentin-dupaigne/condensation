# GET /games/{id}

Full details for a single game.

**Path params:**
- `id` (integer, int64, required)

**Response 200:**
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
  "releaseDateRaw": "Jan 15, 2024",
  "genres": [{ "id": 1, "description": "Action" }],
  "detailedDescription": "<p>HTML...</p>",
  "aboutTheGame": "<p>HTML...</p>",
  "supportedLanguages": "English, French",
  "requiredAge": 18,
  "metacriticScore": 85,
  "currency": "EUR",
  "priceInitial": 1999,
  "pcRequirements": {},
  "macRequirements": {},
  "linuxRequirements": {},
  "updatedAt": "2024-01-15T10:00:00Z",
  "companies": [
    { "company": { "id": 1, "name": "Dev Studio" }, "role": "developer" }
  ],
  "categories": [{ "id": 1, "description": "Single-player" }],
  "screenshots": [
    { "id": 1, "steamId": 100, "pathThumbnail": "https://...", "pathFull": "https://...", "position": 0 }
  ],
  "movies": [
    {
      "id": 1,
      "steamId": 200,
      "name": "Trailer",
      "thumbnail": "https://...",
      "dashAv1": "https://...",
      "dashH264": "https://...",
      "hlsH264": "https://...",
      "highlight": true,
      "position": 0
    }
  ]
}
```

**Response 404:**
```json
{ "status": 404, "message": "Game not found" }
```
