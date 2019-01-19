import baseSquel, { PostgresSquel, Block, QueryBuilder } from 'squel';
import TableTypes from './TableTypes';
import { ColumnOptions } from './FieldTypes';

class CreateTableBlock extends baseSquel.cls.Block {
  _name: string = '';

  table(name: string) {
    this._name = name;
  }

  _toParamString() {
    return {
      text: this._name,
      values: [],
    };
  }
}

class CreateFieldBlock extends baseSquel.cls.Block {
  _fields: { name: string; type: string; options?: ColumnOptions }[] = [];

  field(name: string, type: string, options?: ColumnOptions) {
    this._fields.push({
      name,
      type,
      options,
    });
  }

  _columnModifiers(options?: ColumnOptions): string[] {
    if (!options) return [];
    const modifiers: string[] = [];

    if (options.nonNull) {
      modifiers.push('NOT NULL');
    }

    if (options.primaryKey) {
      modifiers.push('PRIMARY KEY');
    }

    if (options.unique) {
      modifiers.push('UNIQUE');
    }

    if (options.default) {
      modifiers.push(`DEFAULT ${options.default}`);
    }

    return modifiers;
  }

  _toParamString() {
    let str = this._fields
      .map(f => {
        return [
          f.name,
          f.type.toUpperCase(),
          ...this._columnModifiers(f.options),
        ].join(' ');
      })
      .join(', ');

    return {
      text: str,
      values: [],
    };
  }
}

const BLOCK_OPTIONS = {};
class CreateTableQuery extends baseSquel.cls.QueryBuilder {
  constructor(options: TableTypes) {
    const blocks: Block[] = [
      new squel.cls.StringBlock(BLOCK_OPTIONS, 'CREATE'),
    ];

    if (options.temporary) {
      blocks.push(new squel.cls.StringBlock(BLOCK_OPTIONS, 'TEMPORARY'));
    }

    if (options.unlogged) {
      blocks.push(new squel.cls.StringBlock(BLOCK_OPTIONS, 'UNLOGGED'));
    }

    blocks.push(new squel.cls.StringBlock(BLOCK_OPTIONS, 'TABLE'));

    if (options.ifNotExists) {
      blocks.push(new squel.cls.StringBlock(BLOCK_OPTIONS, 'IF NOT EXISTS'));
    }

    blocks.push(
      new CreateTableBlock(BLOCK_OPTIONS),
      new squel.cls.StringBlock(BLOCK_OPTIONS, `(`),
      new CreateFieldBlock(BLOCK_OPTIONS),
    );

    if (options.primaryKey) {
      blocks.push(
        new squel.cls.StringBlock(BLOCK_OPTIONS, `,`),
        new squel.cls.StringBlock(
          BLOCK_OPTIONS,
          `PRIMARY KEY (${
            Array.isArray(options.primaryKey)
              ? options.primaryKey.join(', ')
              : options.primaryKey
          })`,
        ),
      );
    }

    blocks.push(new squel.cls.StringBlock(BLOCK_OPTIONS, `)`));

    if (options.inherits) {
      blocks.push(
        new squel.cls.StringBlock(
          BLOCK_OPTIONS,
          `INHERITS (${options.inherits.join(', ')})`,
        ),
      );
    }

    if (options.onCommit) {
      blocks.push(
        new squel.cls.StringBlock(
          BLOCK_OPTIONS,
          `ON COMMIT ${options.onCommit}`,
        ),
      );
    }

    if (options.tablespace) {
      blocks.push(
        new squel.cls.StringBlock(
          BLOCK_OPTIONS,
          `TABLESPACE ${options.tablespace}`,
        ),
      );
    }

    super(BLOCK_OPTIONS, blocks);
  }
}

interface CreateTableQueryBuilder extends QueryBuilder {
  table(name: string): this;
  field(name: string, type: string, options?: ColumnOptions): this;
}

interface SquelWithCreateTable extends PostgresSquel {
  create(options?: TableTypes): CreateTableQueryBuilder;
}

const squel: SquelWithCreateTable = baseSquel.useFlavour('postgres') as any;

squel.create = function(options?: TableTypes) {
  return new CreateTableQuery(options || {}) as any;
};

export default squel;
