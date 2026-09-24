# Updating MetaGrid

Update MetaGrid only when the discovered information has reuse value.
Do not record every conversational detail.

## Update workflow

1. Identify the Entity described by the evidence.
2. Reuse an existing Entity if it represents the same thing.
3. Split the evidence into independent Fact candidates.
4. Register or reuse the Source record.
5. Compare each Fact candidate with existing facts of the same
   property.
6. Determine whether differences represent history or conflict.
7. Update canonical files only.
8. Run `npm run metagrid:check`.

## Entity matching

Prefer stable technical identifiers over display names.

Use aliases for abbreviations, former names, Japanese names, and other
common references.

If two records might represent the same Entity but the evidence is
insufficient, do not merge them automatically.

## Fact extraction

One sentence can generate multiple facts.

Example:

```text
customer.email comes from CustomerHub and is personal data.
```

produces:

```text
source_system = system:customer-hub
personal_data = true
```

## Existing fact comparison

If the same entity, property, and value already exist, do not create a
duplicate fact merely because another source was found.
Add the additional source reference when appropriate.

If the value differs, first investigate whether the values apply to
different time periods.

If the timeline is known, preserve both facts with suitable validity
ranges.

If the difference cannot be explained, retain separate facts and use
`conflicting` or `candidate` as appropriate.

## Verification

Never mark a fact `verified` solely because an AI inferred it.

Consider:

- source authority
- whether the source describes planned or implemented behavior
- document age and validity period
- consistency with the live system
- corroborating evidence

## Generated files

Never hand-edit:

```text
metagrid/catalog.json
metagrid/indexes/**
```

The build script recreates them.

## Validation

After any canonical change, run:

```text
npm run metagrid:check
```

Resolve validation errors before treating the update as complete.
