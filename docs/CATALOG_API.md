# Catalog API

The app loads products from an external HTTP API when `CATALOG_API_URL` is set. Otherwise it uses the built-in mock catalog.

## Response format

`GET` your URL must return JSON in one of these shapes:

```json
{
  "products": [
    {
      "id": "twin-xl-sheets",
      "name": "Twin XL Sheet Set",
      "category": "Bedding",
      "basePrice": 35,
      "link": "https://example.com/...",
      "essential": true,
      "priority": 100,
      "climates": ["hot", "four-season", "variable"],
      "dormTypes": ["traditional-double", "suite"],
      "hobby": "gaming"
    }
  ]
}
```

Or a bare array of product objects.

### Fields

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Unique string |
| `name` | yes | Display name |
| `category` | yes | Groups checklist (e.g. Bedding) |
| `basePrice` | yes | Standard tier price (USD integer) |
| `link` | no | Defaults to placeholder search URL |
| `essential` | no | `true` = core item, higher rank |
| `priority` | no | Sort weight within category (default 50) |
| `climates` | no | Only show for these climates |
| `dormTypes` | no | Only show for these dorm types |
| `hobby` | no | Only when student selected this hobby |

## Quick local test (no external host)

1. Copy `.env.example` to `.env.local`
2. Set:

```env
CATALOG_API_URL=http://localhost:3000/api/catalog
```

3. Run `npm run dev` — `/api/catalog` serves the same catalog as the mock (or your external URL when configured).

## Host your own catalog

1. Export `mockCatalog` from `src/lib/mockData.ts` to JSON (`{ "products": [...] }`).
2. Host on GitHub Raw, Supabase Storage, S3, or any static HTTPS URL.
3. Set `CATALOG_API_URL` to that URL in `.env.local` (and in Vercel env for production).

## Auth

If the API requires a token:

```env
CATALOG_API_KEY=your-secret-token
```

Sent as `Authorization: Bearer <token>`.

## Debug

Open [http://localhost:3000/api/catalog](http://localhost:3000/api/catalog) to inspect the normalized catalog the app uses.
