import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const metagridDir = path.join(root, 'metagrid');
const entitiesDir = path.join(metagridDir, 'entities');
const indexesDir = path.join(metagridDir, 'indexes');
const configDir = path.join(metagridDir, 'config');

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const text = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(filePath, text, 'utf8');
}

async function findFiles(dir, fileName) {
  const result = [];
  let entries = [];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return result;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...await findFiles(fullPath, fileName));
    } else if (entry.isFile() && entry.name === fileName) {
      result.push(fullPath);
    }
  }

  return result;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

function sortBy(items, selector) {
  return items.sort((a, b) => {
    return selector(a).localeCompare(selector(b));
  });
}

async function loadEntities() {
  const files = await findFiles(entitiesDir, 'entity.json');
  const records = [];

  for (const entityPath of files) {
    const dir = path.dirname(entityPath);
    const factsPath = path.join(dir, 'facts.json');
    const readmePath = path.join(dir, 'README.md');
    const entity = await readJson(entityPath);
    const facts = await readJson(factsPath);

    records.push({
      entity,
      facts: facts.facts,
      entityPath,
      factsPath,
      readmePath,
    });
  }

  return sortBy(records, item => item.entity.id);
}

function makeTypeIndexes(entityTypes, records) {
  const indexes = {};

  for (const type of Object.keys(entityTypes)) {
    indexes[type] = [];
  }

  for (const record of records) {
    const { entity } = record;
    indexes[entity.type] ??= [];
    indexes[entity.type].push({
      entity: entity.id,
      name: entity.name,
      parent: entity.parent ?? null,
      entity_path: relative(record.entityPath),
      facts_path: relative(record.factsPath),
      readme_path: relative(record.readmePath),
    });
  }

  for (const type of Object.keys(indexes)) {
    sortBy(indexes[type], item => item.entity);
  }

  return indexes;
}

function makePropertyIndexes(properties, records) {
  const indexes = {};

  for (const property of Object.keys(properties)) {
    indexes[property] = [];
  }

  for (const record of records) {
    for (const fact of record.facts) {
      indexes[fact.property] ??= [];
      indexes[fact.property].push({
        entity: record.entity.id,
        entity_type: record.entity.type,
        fact_id: fact.id,
        value: fact.value,
        status: fact.status,
        valid_from: fact.valid_from ?? null,
        valid_to: fact.valid_to ?? null,
        facts_path: relative(record.factsPath),
      });
    }
  }

  for (const property of Object.keys(indexes)) {
    sortBy(indexes[property], item => {
      return `${item.entity}\u0000${item.fact_id}`;
    });
  }

  return indexes;
}

function makeAliasIndex(records) {
  const entries = [];

  for (const record of records) {
    const aliases = new Set([
      record.entity.name,
      ...(record.entity.aliases ?? []),
    ]);

    for (const alias of aliases) {
      entries.push({
        alias,
        normalized: alias.toLocaleLowerCase(),
        entity: record.entity.id,
        entity_type: record.entity.type,
        entity_path: relative(record.entityPath),
      });
    }
  }

  return {
    entries: sortBy(entries, item => {
      return `${item.normalized}\u0000${item.entity}`;
    }),
  };
}

async function build() {
  const entityTypes = await readJson(
    path.join(configDir, 'entity-types.json'),
  );
  const properties = await readJson(
    path.join(configDir, 'properties.json'),
  );
  const records = await loadEntities();

  const typeIndexes = makeTypeIndexes(entityTypes, records);
  const propertyIndexes = makePropertyIndexes(properties, records);
  const aliasIndex = makeAliasIndex(records);

  await fs.rm(indexesDir, { recursive: true, force: true });
  await fs.mkdir(path.join(indexesDir, 'by-type'), {
    recursive: true,
  });
  await fs.mkdir(path.join(indexesDir, 'by-property'), {
    recursive: true,
  });

  for (const [type, entries] of Object.entries(typeIndexes)) {
    const filePath = path.join(
      indexesDir,
      'by-type',
      `${type}.json`,
    );
    await writeJson(filePath, { type, entries });
  }

  for (const [property, entries] of Object.entries(
    propertyIndexes,
  )) {
    const filePath = path.join(
      indexesDir,
      'by-property',
      `${property}.json`,
    );
    await writeJson(filePath, { property, entries });
  }

  await writeJson(
    path.join(indexesDir, 'aliases.json'),
    aliasIndex,
  );

  const catalog = {
    entity_types: {},
    properties: {},
  };

  for (const [type, config] of Object.entries(entityTypes)) {
    catalog.entity_types[type] = {
      description: config.description,
      index: `metagrid/indexes/by-type/${type}.json`,
      count: typeIndexes[type]?.length ?? 0,
    };
  }

  for (const [property, config] of Object.entries(properties)) {
    catalog.properties[property] = {
      description: config.description,
      value_type: config.value_type,
      index:
        `metagrid/indexes/by-property/${property}.json`,
      count: propertyIndexes[property]?.length ?? 0,
    };
  }

  catalog.aliases = {
    index: 'metagrid/indexes/aliases.json',
    count: aliasIndex.entries.length,
  };

  await writeJson(
    path.join(metagridDir, 'catalog.json'),
    catalog,
  );

  console.log(
    `Built MetaGrid indexes for ${records.length} entities.`,
  );
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
