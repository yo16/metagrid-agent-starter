# MetaGrid data model

## Entity

An Entity is something the organization wants to reason about.
Examples include a system, dataset, table, column, report, business
term, business process, organization, or role.

Each entity directory contains `entity.json`.

Example:

```json
{
  "id": "bigquery:project-a.dataset-a.customer.email",
  "type": "column",
  "name": "email",
  "parent": "bigquery:project-a.dataset-a.customer",
  "aliases": ["customer email", "顧客メール"]
}
```

Entity IDs should be stable and globally unique inside the MetaGrid.

## Fact

A Fact is one independent assertion about one entity.

Example:

```json
{
  "id": "fact-000001",
  "property": "personal_data",
  "value": true,
  "status": "verified",
  "valid_from": "2024-10-01",
  "valid_to": null,
  "sources": ["confluence:123456"]
}
```

A `facts.json` file contains the entity ID and an array of facts.

Example:

```json
{
  "entity": "bigquery:project-a.dataset-a.customer.email",
  "facts": []
}
```

Do not place multiple independent claims in one Fact.

## Fact statuses

Allowed statuses are:

- `verified`
- `candidate`
- `conflicting`
- `deprecated`

`verified` requires adequate evidence.

`candidate` is used for plausible but unconfirmed information.

`conflicting` is used when incompatible evidence exists.

`deprecated` is used when a fact was previously valid but is no
longer current.

## Validity

`valid_from` and `valid_to` describe when the Fact is true.
They do not describe when a source page was created or edited.

Dates use `YYYY-MM-DD` when known.

Use `null` when no end date is known and the fact is still current.
Omit a date only when it cannot be established.

## Property

Properties are defined in:

```text
metagrid/config/properties.json
```

Reuse an existing property whenever possible.
Do not introduce synonyms such as `pii`, `personal_info`, and
`personal_data` for the same concept.

A property can optionally constrain its expected value type.

## Source

A Source records where evidence came from.

Example:

```json
{
  "id": "confluence:123456",
  "type": "confluence",
  "title": "顧客データ連携仕様",
  "url": "https://example.atlassian.net/wiki/...",
  "section": "3.2 顧客メールアドレス",
  "created_at": "2024-02-10",
  "updated_at": "2025-04-10"
}
```

A Source does not itself make a Fact verified.
The content, authority, date, and consistency of the evidence still
need to be evaluated.

## README.md

Use `README.md` for narrative information such as:

- business context
- design rationale
- change history
- important caveats
- explanations that do not fit one property/value pair

Structured facts remain the preferred source for filtering and exact
queries.
