# Searching MetaGrid

The goal is to answer questions while loading as little context as
possible.

## Search order

Always prefer this order:

```text
Question
  -> catalog.json
  -> relevant indexes
  -> matching entity.json and facts.json
  -> README.md when context is needed
  -> original source when evidence is needed
  -> external search only when MetaGrid is insufficient
```

Do not read all entities or all indexes as a precaution.

## Structured questions

Translate clear questions into entity type and property conditions.

Example:

```text
Which columns contain personal information?
```

becomes:

```text
entity type = column
personal_data = true
```

Read the `column` type index and the `personal_data` property index.
Intersect the resulting entity IDs.

Example:

```text
Which personal-data columns come from CustomerHub?
```

becomes:

```text
entity type = column
personal_data = true
source_system = system:customer-hub
```

Read only those three relevant indexes.

## Current facts

For a question about the current state, prefer facts whose validity
contains the current date and whose status is `verified`.

Do not silently discard conflicting facts. Surface them when they are
material to the answer.

## Historical questions

For a question about a specific date, select facts where the date is
inside the fact validity period.

Do not use a current fact to answer a historical question unless the
fact is explicitly valid for that period.

## Narrative questions

Questions such as these may require `README.md`:

- Why was this design chosen?
- What does this data mean to the business?
- What changed during the migration?

Use indexes to identify the relevant entity first. Do not begin with a
full scan of all Markdown files.

## Missing information

If MetaGrid does not contain the required information, search the most
appropriate original source.

Typical source priority:

- physical BigQuery structure: BigQuery
- business requirements and rationale: Confluence
- access rights: IAM
- implementation behavior: code and configuration

When a reusable fact is discovered, follow `update.md` and add it to
MetaGrid.
