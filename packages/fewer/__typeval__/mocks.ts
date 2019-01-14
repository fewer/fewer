import {
  createDatabase,
  Adapter as BaseAdapter,
  FieldTypes as BaseFieldTypes,
  FieldType,
} from '../src';

interface Fields {
  [name: string]: FieldType;
}

class FieldTypes<Obj extends Fields = {}> extends BaseFieldTypes<Obj> {
  field<Name extends string>(
    name: Name,
  ): FieldTypes<Obj & { [P in Name]: FieldType<string> }> {
    return this.addField(name, new FieldType('string'));
  }
}

export class Adapter implements BaseAdapter {
  FieldTypes = FieldTypes;
  async connect() {}
  async select() {
    return [];
  }
  async insert() {
    return null;
  }
  async update() {
    return null;
  }
}

export const adapter = new Adapter();
export const database = createDatabase({
  adapter,
});
