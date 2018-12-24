import squel from 'squel';

class CreateTableBlock extends squel.cls.Block {
  private _name!: string;

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

class CreateFieldBlock extends squel.cls.Block {
  private _fields: {
    name: string;
    type: string;
  }[];

  constructor(options?: squel.QueryBuilderOptions) {
    super(options);
    this._fields = [];
  }

  field(name: string, type: string) {
    this._fields.push({
      name: name,
      type: type,
    });
  }

  _toParamString() {
    let str = this._fields
      .map(f => {
        return `${f.name} ${f.type.toUpperCase()}`;
      })
      .join(', ');

    return {
      text: `(${str})`,
      values: [],
    };
  }
}

export default class Create extends squel.cls.QueryBuilder {
  constructor(options: squel.QueryBuilderOptions) {
    super(options, [
      new squel.cls.StringBlock(options, 'CREATE TABLE'),
      new CreateTableBlock(options),
      new CreateFieldBlock(options),
    ]);
  }
}
