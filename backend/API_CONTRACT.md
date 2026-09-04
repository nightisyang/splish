# Splish Waterfall API Contract

Base path: `/api/v1/waterfalls`

All successful responses use JSON. Unknown waterfall IDs return the existing API
error response with HTTP `404`.

## List waterfalls

`GET /api/v1/waterfalls`

Supported query parameters include `state`, `name`, `difficulty`, `sort`, `page`,
and `limit`. The default page is `1`; the default limit is `200`, and the maximum
limit is `500`.

```json
{
  "status": "success",
  "results": 1,
  "pagination": {
    "page": 1,
    "limit": 200,
    "total": 298,
    "pages": 2
  },
  "data": {
    "waterfalls": [
      {
        "_id": "62e257d0a55e10ce136039ee",
        "id": 1,
        "name": "Air Hitam falls",
        "slug": "air-hitam-falls",
        "description": "First paragraph.\n\nSecond paragraph.",
        "descriptionParagraphs": [
          "First paragraph.",
          "Second paragraph."
        ],
        "state": "Perak",
        "location": {
          "type": "Point",
          "coordinates": [100.84717, 5.02017]
        },
        "waterSource": "Natural Stream",
        "waterfallProfile": "Cascade",
        "accessibility": "Trekking",
        "imgDetails": {},
        "url": "131airhitam.php",
        "locality": null,
        "summary": null,
        "lastUpdate": null,
        "difficulty": null
      }
    ]
  }
}
```

`results` is the number of waterfalls in this response page, not the total number
of rows matching the filter. `pagination.total` is the total matching count.

## Catalog discovery

`GET /api/v1/waterfalls/manifest`

This is the stable discovery endpoint for clients and integrations. It allows a
consumer to identify a new catalog snapshot without reading or scraping the
upstream website.

```json
{
  "status": "success",
  "data": {
    "catalog": {
      "version": "2f42e819068669d7",
      "refreshedAt": "2026-09-04T02:15:11.719Z",
      "source": "https://waterfallsofmalaysia.com",
      "activeRecords": 298,
      "endpoints": {
        "waterfalls": "/api/v1/waterfalls?limit=500&sort=name",
        "detail": "/api/v1/waterfalls/{id}"
      }
    }
  }
}
```

## Waterfall detail

`GET /api/v1/waterfalls/:id`

`:id` may be the string MongoDB-era `_id` or the numeric SQLite `id`.

```json
{
  "status": "success",
  "data": {
    "waterfall": {
      "_id": "62e257d0a55e10ce136039ee",
      "id": 1,
      "name": "Air Hitam falls",
      "description": "First paragraph.\n\nSecond paragraph.",
      "descriptionParagraphs": [
        "First paragraph.",
        "Second paragraph."
      ]
    }
  }
}
```

The actual `waterfall` object has the same fields as each list item. JSON omits
the optional `distance` property when no coordinates are supplied.

`GET /api/v1/waterfalls/:id/:latlng/` accepts `latlng` as `latitude,longitude`
and adds `data.distance`, rounded to one decimal place in kilometres.

## Description fields contract

Every waterfall exposes both description representations:

- `descriptionParagraphs` is the canonical array of non-empty plain-text
  paragraphs extracted by the validated refresh pipeline.
- `description` is the compatibility representation and is always exactly
  `descriptionParagraphs.join("\n\n")` (two newline characters, with no extra
  newline at either end).
- Neither field contains HTML or executable markup. Clients must render their
  contents as text and must not inject them as HTML.

The current sanitized SQLite description is authoritative. The historical
`data/descriptionParagraphs.json` artifact remains as a fallback only when an
older tracked row has no usable description. Source fragments are never filled
by inference, and clients never receive executable markup.

## HTTP caching

- The manifest is fresh for 60 seconds and may be served stale for five minutes
  while it is revalidated.
- List responses are fresh for five minutes and may be served stale for one hour.
- Detail responses are fresh for one hour and may be served stale for one day.
- Waterfall images are fresh for seven days and may be served stale for 30 days.
- List and detail responses include `X-Splish-Catalog-Version`. Clients should
  include that value in persistent cache keys so promoting a catalog snapshot
  invalidates older data without requiring a blanket cache purge.
