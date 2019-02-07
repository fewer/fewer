import { Migration, ColumnType, Operations } from 'fewer';
import squel from './squel';
import { CharacterOptions, NumericOptions } from './columnTypes';

function getTypeName(type: ColumnType): string {
  // If there is no config, then we only have the name:
  if (!type.config) return type.name;

  switch (type.name) {
    case 'char':
    case 'varchar': {
      const config: CharacterOptions = type.config;
      if (config.length) {
        return `${type.name}(${config.length})`;
      }
      return type.name;
    }
    case 'numeric':
    case 'decimal': {
      const config: NumericOptions = type.config;
      if (config.scale) {
        return `${type.name}(${config.precision}, ${config.scale})`;
      }
      if (config.precision) {
        return `${type.name}(${config.precision})`;
      }
      return type.name;
    }
    case 'array': {
      return `${getTypeName(type.config.subtype)}[]`;
    }
    default:
      return type.name;
  }
}

function createTable(operation: Operations.CreateTable) {
  const create = squel.create(operation.options);
  create.table(operation.name);
  for (const [columnName, columnType] of Object.entries(operation.columns)) {
    const typeName = getTypeName(columnType);
    create.field(columnName, typeName, columnType.config);
  }
  return create.toString();
}

function dropTable(operation: Operations.DropTable) {
  return squel.dropTable(operation.name).toString();
}

export default function migrate(
  migration: Migration,
) {
  const sqls: (null | string)[] = migration.operations.map(operation => {
    switch (operation.type) {
      case 'createTable':
        return createTable(operation);
      case 'dropTable':
        return dropTable(operation);
      default:
        return null;
    }
  });

  return sqls.filter(Boolean).join('; ');
}
