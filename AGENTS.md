# MetaGrid Agent Guide

## Purpose

MetaGrid is a thin knowledge layer over existing sources such as
BigQuery, Confluence, code, design documents, and IAM information.
It does not replace those systems.

Use MetaGrid to answer questions quickly, preserve reusable facts,
and keep links to the original evidence.

## Core workflow

When answering a question:

1. Read `metagrid/catalog.json`.
2. Use only the indexes relevant to the question.
3. Load only the matching entities and facts.
4. Read an entity `README.md` only when context is needed.
5. Read original sources only when evidence is needed.
6. Search Confluence or another source only if MetaGrid is missing
   the required information.
7. If new reusable facts are discovered, update the MetaGrid source
   files.
8. Run validation and rebuild indexes after updates.

Never start by reading the whole MetaGrid or searching all of
Confluence.

## Source of truth

The canonical MetaGrid files are:

- `entity.json`: stable entity identity and aliases.
- `facts.json`: structured facts about that entity.
- `README.md`: human-readable context and history.
- `metagrid/sources/**`: metadata about original evidence.
- `metagrid/config/**`: allowed entity types and properties.

Everything under `metagrid/indexes/` and `metagrid/catalog.json` is
derived data. Do not edit generated files by hand.

## Facts

Treat each independent assertion as one Fact.

Do not combine statements such as:

- `source_system = CustomerHub`
- `personal_data = true`

into one Fact.

Facts should preserve evidence, status, and time validity when known.
Do not overwrite historical facts merely because a newer fact exists.

## Uncertainty

Never convert an inference into a verified fact.

Use these statuses:

- `verified`: supported and confirmed.
- `candidate`: plausible but not sufficiently confirmed.
- `conflicting`: incompatible evidence exists.
- `deprecated`: previously valid but no longer current.

If sources conflict, keep the conflicting facts and explain the
conflict. Do not resolve it by guesswork.

## Time

Source timestamps and fact validity are different concepts.

A Confluence page updated in 2026 may describe a fact that became
valid in 2024. Preserve `valid_from` and `valid_to` separately from
source creation or update dates.

## Updating MetaGrid

Before adding or changing MetaGrid data, read:

- `docs/metagrid/schema.md`
- `docs/metagrid/update.md`

After changing canonical files, run:

```text
npm run metagrid:check
```

Do not manually update indexes.

## Searching MetaGrid

Before performing a MetaGrid search, read:

- `docs/metagrid/search.md`

Use structured indexes before full-text or semantic search whenever
possible.

## Detailed documentation

- Overview: `docs/metagrid/README.md`
- Data model: `docs/metagrid/schema.md`
- Search procedure: `docs/metagrid/search.md`
- Update procedure: `docs/metagrid/update.md`

Keep this file short. Put detailed rules in the documents above.
