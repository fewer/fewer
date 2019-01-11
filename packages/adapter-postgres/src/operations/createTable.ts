import * as FieldTypes from '../FieldTypes';

const SERIAL_MAPPING: { [key: string]: string | undefined } = {
  'integer': 'serial',
  'smallint': 'smallserial',
  'bigint': 'bigserial'
}

export type TableOptions<K> = {
  primaryKey?: K[]
}

export interface CreateTableDefinition {
  [key: string]: FieldTypes.Type<any, boolean>;
}

export function createTable(name: string, options: TableOptions<string>, definition: CreateTableDefinition): [string, string] {
  const isPrimaryKey = (fieldName: string) => {
    return options.primaryKey &&
      options.primaryKey.length === 1 &&
      options.primaryKey.includes(fieldName);
  };

  let upSql = `CREATE TABLE ${name} (\n`;
  let columnParts: string[] = [];
  let constraintParts: string[] = [];

  for (let fieldName in definition) {
    const fieldType = definition[fieldName];
    let type = fieldType.name;

    if (fieldType.config.autoIncrement) {
      const serial = SERIAL_MAPPING[type];

      if (serial) {
        type = serial;
      }
    }

    let str = `  ${fieldName} ${type}`;

    if (fieldType.config.nonNull) {
      str += ' NOT NULL'
    }

    if (isPrimaryKey(fieldName)) {
      str += ' PRIMARY KEY';
    }

    columnParts.push(str);

    if (fieldType.config.unique) {
      constraintParts.push(`  UNIQUE (${fieldName})`);
    }
  }

  if (options.primaryKey && options.primaryKey.length > 1) {
    constraintParts.push(`  PRIMARY KEY (${options.primaryKey.join(', ')})`);
  }

  const parts = columnParts.concat(constraintParts);
  upSql += parts.join(',\n');

  upSql += '\n);';

  return [upSql, `DROP TABLE ${name};`];
}