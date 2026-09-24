# MetaGrid overview

MetaGrid is a thin knowledge layer that connects facts about the same
real-world or technical entity across multiple information sources.

It is intentionally not a replacement for BigQuery, Confluence, IAM,
source code, or design documents.

## Design goals

- Answer recurring questions without repeatedly searching all sources.
- Preserve evidence for every reusable fact.
- Preserve history instead of overwriting old facts.
- Allow contradictory information to coexist until resolved.
- Load only the information needed for the current question.
- Keep canonical files human-readable and AI-editable.
- Generate search indexes mechanically from canonical data.

## Canonical data

Each entity has three files:

```text
entity.json
facts.json
README.md
```

`entity.json` identifies the entity.

`facts.json` contains structured assertions.

`README.md` contains narrative context that is difficult to express as
individual facts.

Source records under `metagrid/sources/` describe the evidence used by
facts.

## Generated data

The build script generates:

```text
metagrid/catalog.json
metagrid/indexes/by-type/*.json
metagrid/indexes/by-property/*.json
metagrid/indexes/aliases.json
```

These files are disposable and can always be rebuilt from canonical
files.
