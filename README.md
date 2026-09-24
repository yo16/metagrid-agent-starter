# MetaGrid Agent Starter

A file-based MetaGrid designed for AI agents.

The canonical knowledge is stored as Markdown and JSON. Search indexes
are generated from the canonical files and should never be edited by
hand.

## Setup

Node.js 18 or later is enough. No npm dependencies are required.

```text
npm run metagrid:check
```

## Main commands

```text
npm run metagrid:validate
npm run metagrid:build
npm run metagrid:check
```

`metagrid:validate` validates configuration, entities, facts, and
sources.

`metagrid:build` recreates `metagrid/indexes/` and
`metagrid/catalog.json`.

`metagrid:check` validates first, then rebuilds the indexes.

## Add an entity

Create a directory below the matching entity type:

```text
metagrid/entities/columns/customer.email/
  entity.json
  facts.json
  README.md
```

Then run:

```text
npm run metagrid:check
```

See `docs/metagrid/` for the detailed rules.
