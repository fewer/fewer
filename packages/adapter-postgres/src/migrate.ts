import { Migration, FieldType } from 'fewer';
import squel from './squel';
import { CharacterOptions, NumericOptions } from './FieldTypes';

function getTypeName(type: FieldType): string {
  // If there is no config, then we only have the name:
  if (!type.config) return type.name;

  switch (type.name) {
    case 'char':
    case 'varchar': {
      const config: CharacterOptions = type.config;
      return `${type.name}(${config.length})`;
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

export default function migrate(migration: Migration) {
  const sqls: string[] = [];

  migration.operations.forEach(operation => {
    if (operation.type === 'createTable') {
      const create = squel.create(operation.options);
      create.table(operation.name);
      for (const [columnName, columnType] of Object.entries(operation.fields)) {
        const typeName = getTypeName(columnType);
        create.field(columnName, typeName, columnType.config);
      }
      sqls.push(create.toString());
    }
  });

  return sqls.join('; ');
}
