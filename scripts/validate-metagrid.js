import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const metagridDir = path.join(root, 'metagrid');
const entitiesDir = path.join(metagridDir, 'entities');
const sourcesDir = path.join(metagridDir, 'sources');
const configDir = path.join(metagridDir, 'config');

const statuses = new Set([
  'verified',
  'candidate',
  'conflicting',
  'deprecated',
]);

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findNamedFiles(dir, fileName) {
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
      result.push(...await findNamedFiles(fullPath, fileName));
    } else if (entry.isFile() && entry.name === fileName) {
      result.push(fullPath);
    }
  }

  return result;
}

async function findJsonFiles(dir) {
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
      result.push(...await findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      result.push(fullPath);
    }
  }

  return result;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll('\\', '/');
}

function isObject(value) {
  return Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value);
}

function isDate(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().startsWith(value);
}

function valueMatchesType(value, valueType) {
  if (valueType === 'boolean') {
    return typeof value === 'boolean';
  }
  if (valueType === 'string') {
    return typeof value === 'string';
  }
  if (valueType === 'number') {
    return typeof value === 'number';
  }
  if (valueType === 'entity_id') {
    return typeof value === 'string' && value.length > 0;
  }
  if (valueType === 'entity_id_or_string') {
    return typeof value === 'string' && value.length > 0;
  }
  return true;
}

function validateEntityShape(entity, label, errors) {
  if (!isObject(entity)) {
    errors.push(`${label}: entity must be an object`);
    return false;
  }

  for (const key of ['id', 'type', 'name']) {
    if (typeof entity[key] !== 'string' || !entity[key]) {
      errors.push(`${label}: ${key} must be a non-empty string`);
    }
  }

  if (
    entity.parent !== undefined &&
    entity.parent !== null &&
    typeof entity.parent !== 'string'
  ) {
    errors.push(`${label}: parent must be string or null`);
  }

  if (entity.aliases !== undefined) {
    if (!Array.isArray(entity.aliases)) {
      errors.push(`${label}: aliases must be an array`);
    } else if (entity.aliases.some(item => {
      return typeof item !== 'string' || !item;
    })) {
      errors.push(`${label}: aliases must contain strings`);
    }
  }

  return true;
}

function validateFactFileShape(factFile, label, errors) {
  if (!isObject(factFile)) {
    errors.push(`${label}: facts file must be an object`);
    return false;
  }

  if (typeof factFile.entity !== 'string' || !factFile.entity) {
    errors.push(`${label}: entity must be a non-empty string`);
  }

  if (!Array.isArray(factFile.facts)) {
    errors.push(`${label}: facts must be an array`);
    return false;
  }

  return true;
}

function validateFactShape(fact, label, errors) {
  if (!isObject(fact)) {
    errors.push(`${label}: fact must be an object`);
    return false;
  }

  for (const key of ['id', 'property', 'status']) {
    if (typeof fact[key] !== 'string' || !fact[key]) {
      errors.push(`${label}: ${key} must be a non-empty string`);
    }
  }

  if (!Object.hasOwn(fact, 'value')) {
    errors.push(`${label}: value is required`);
  }

  if (!statuses.has(fact.status)) {
    errors.push(`${label}: invalid status ${fact.status}`);
  }

  if (!Array.isArray(fact.sources) || fact.sources.length === 0) {
    errors.push(`${label}: sources must be a non-empty array`);
  } else if (fact.sources.some(source => {
    return typeof source !== 'string' || !source;
  })) {
    errors.push(`${label}: sources must contain source ids`);
  }

  if (!isDate(fact.valid_from)) {
    errors.push(`${label}: valid_from must be YYYY-MM-DD or null`);
  }
  if (!isDate(fact.valid_to)) {
    errors.push(`${label}: valid_to must be YYYY-MM-DD or null`);
  }

  if (
    fact.valid_from &&
    fact.valid_to &&
    fact.valid_from > fact.valid_to
  ) {
    errors.push(`${label}: valid_from is after valid_to`);
  }

  if (
    fact.confidence !== undefined &&
    fact.confidence !== null &&
    (
      typeof fact.confidence !== 'number' ||
      fact.confidence < 0 ||
      fact.confidence > 1
    )
  ) {
    errors.push(`${label}: confidence must be between 0 and 1`);
  }

  return true;
}

function validateSourceShape(source, label, errors) {
  if (!isObject(source)) {
    errors.push(`${label}: source must be an object`);
    return false;
  }

  for (const key of ['id', 'type', 'title']) {
    if (typeof source[key] !== 'string' || !source[key]) {
      errors.push(`${label}: ${key} must be a non-empty string`);
    }
  }

  if (!isDate(source.created_at)) {
    errors.push(`${label}: created_at must be YYYY-MM-DD or null`);
  }
  if (!isDate(source.updated_at)) {
    errors.push(`${label}: updated_at must be YYYY-MM-DD or null`);
  }

  return true;
}

async function main() {
  const entityTypes = await readJson(
    path.join(configDir, 'entity-types.json'),
  );
  const properties = await readJson(
    path.join(configDir, 'properties.json'),
  );

  const errors = [];
  const warnings = [];
  const entityIds = new Set();
  const factIds = new Set();
  const sourceIds = new Set();
  const referencedSources = [];

  const sourceFiles = await findJsonFiles(sourcesDir);
  for (const sourcePath of sourceFiles) {
    let source;
    try {
      source = await readJson(sourcePath);
    } catch (error) {
      errors.push(`${relative(sourcePath)}: ${error.message}`);
      continue;
    }

    const label = relative(sourcePath);
    if (!validateSourceShape(source, label, errors)) {
      continue;
    }

    if (sourceIds.has(source.id)) {
      errors.push(`Duplicate source id: ${source.id}`);
    }
    sourceIds.add(source.id);
  }

  const entityFiles = await findNamedFiles(
    entitiesDir,
    'entity.json',
  );

  for (const entityPath of entityFiles) {
    const dir = path.dirname(entityPath);
    const factsPath = path.join(dir, 'facts.json');
    const readmePath = path.join(dir, 'README.md');

    let entity;
    try {
      entity = await readJson(entityPath);
    } catch (error) {
      errors.push(`${relative(entityPath)}: ${error.message}`);
      continue;
    }

    const entityLabel = relative(entityPath);
    validateEntityShape(entity, entityLabel, errors);

    if (entity.id && entityIds.has(entity.id)) {
      errors.push(`Duplicate entity id: ${entity.id}`);
    }
    if (entity.id) {
      entityIds.add(entity.id);
    }

    const typeConfig = entityTypes[entity.type];
    if (entity.type && !typeConfig) {
      errors.push(
        `${entity.id}: unknown entity type ${entity.type}`,
      );
    } else if (typeConfig) {
      const expectedPart = [
        'metagrid',
        'entities',
        typeConfig.directory,
      ].join('/');
      if (!relative(entityPath).startsWith(expectedPart)) {
        warnings.push(
          `${entity.id}: expected under ${expectedPart}`,
        );
      }
    }

    if (!await fileExists(readmePath)) {
      warnings.push(`${entity.id}: README.md is missing`);
    }

    if (!await fileExists(factsPath)) {
      errors.push(`${entity.id}: facts.json is missing`);
      continue;
    }

    let factFile;
    try {
      factFile = await readJson(factsPath);
    } catch (error) {
      errors.push(`${relative(factsPath)}: ${error.message}`);
      continue;
    }

    const factFileLabel = relative(factsPath);
    if (!validateFactFileShape(
      factFile,
      factFileLabel,
      errors,
    )) {
      continue;
    }

    if (factFile.entity !== entity.id) {
      errors.push(
        `${factFileLabel}: entity id does not match entity.json`,
      );
    }

    for (const fact of factFile.facts) {
      const factLabel = `${factFileLabel}:${fact.id ?? '?'}`;
      validateFactShape(fact, factLabel, errors);

      if (fact.id && factIds.has(fact.id)) {
        errors.push(`Duplicate fact id: ${fact.id}`);
      }
      if (fact.id) {
        factIds.add(fact.id);
      }

      const property = properties[fact.property];
      if (fact.property && !property) {
        errors.push(
          `${fact.id}: unknown property ${fact.property}`,
        );
      } else if (
        property &&
        !valueMatchesType(fact.value, property.value_type)
      ) {
        errors.push(
          `${fact.id}: value does not match ` +
          `${property.value_type}`,
        );
      }

      if (Array.isArray(fact.sources)) {
        for (const sourceId of fact.sources) {
          referencedSources.push({
            sourceId,
            factId: fact.id,
          });
        }
      }
    }
  }

  for (const reference of referencedSources) {
    if (!sourceIds.has(reference.sourceId)) {
      errors.push(
        `${reference.factId}: missing source ` +
        reference.sourceId,
      );
    }
  }

  for (const warning of warnings) {
    console.warn(`WARN: ${warning}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR: ${error}`);
    }
    console.error(
      `Validation failed with ${errors.length} error(s).`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validation passed: ${entityIds.size} entities, ` +
    `${factIds.size} facts, ${sourceIds.size} sources.`,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
