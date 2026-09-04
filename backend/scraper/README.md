# Splish catalog refresh

The supported refresh is deliberately staged. It does not edit the live
database while scraping.

```sh
# Use the Node 22 runtime expected by better-sqlite3 in this repository.
node index.js stage --verbose
node index.js assets --verbose
node index.js publish-assets       # preview object count and bytes
node index.js publish-assets --apply --verbose
node index.js promote             # preview only
node index.js promote --apply     # backup, then one transaction
```

`stage` discovers the current state listings, parses their labeled fields,
uses the source site's map as a coordinate fallback, pairs thumbnail and
full-size image URLs, and writes a quality report. A partial `--state` or
`--limit` run is useful for parser development but cannot be promoted.

`assets` is resumable. It downloads list images, detail thumbnails, and the
corresponding full-size files. Generated asset namespaces and staging files
are intentionally excluded from Git.

`publish-assets` uploads exactly the files referenced by the staged catalog to
Cloudflare R2 or another S3-compatible object store. It uses SHA-256 metadata
to skip unchanged objects and never prints credentials. Configure the `R2_*`
values shown in `backend/config.env.example`; object keys retain the local
`images/full`, `images/thumb`, and `images/listing` structure. For production,
set the PWA's `VITE_SPLISH_ASSET_BASE_URL` to the same public custom domain.

`promote` defaults to a read-only preview. `--apply` first creates a consistent
SQLite backup and then updates/inserts the complete snapshot in one
transaction. Records are reconciled by canonical name and source URL, which
also repairs historical URL collisions without changing established IDs.

## Deterministic versus LLM work

The normal pipeline is deterministic:

- active-record discovery and state/category metadata;
- label-based detail parsing despite nested legacy markup;
- coordinate parsing and source-map fallback;
- thumbnail/full-image pairing and downloads;
- paragraph and boilerplate boundaries;
- aliases, reconciliation, validation, backup, and promotion.

Codex is opt-in with `stage --llm`. It runs only for descriptions flagged by
the quality rules and may repair paragraph structure or remove obvious widget
text. It is explicitly forbidden from inventing facts, access advice, safety
claims, place names, or coordinates. Its structured result is stored with the
staged record for review.

The homepage currently advertises 322 historical descriptions, while the
state listings expose 298 active entries and the map exposes 297 markers. The
pipeline treats the state listings as the active catalog and does not silently
publish historical/unlisted pages.
