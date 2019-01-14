import FieldType from '../FieldType';
import { INTERNAL_TYPES } from '../types';

export interface Fields {
  [key: string]: FieldType;
}

export default class FieldTypes<Obj extends Fields = {}> {
  [INTERNAL_TYPES.INTERNAL_TYPE]: Obj;

  fields: Fields;

  constructor(fields = {}) {
    this.fields = fields;
  }

  // TODO: Should this be immutable, or should this just add to fields?
  addField(name: string, type: FieldType) {
    this.fields[name] = type;
    return this;
  }
}
