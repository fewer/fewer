const USER_DEFINED_TABLE_NAME = Symbol('TableName');

export default class Record {
  static [USER_DEFINED_TABLE_NAME]: string;

  static set tableName(name) {
    this[USER_DEFINED_TABLE_NAME] = name;
  }

  static get tableName() {
    return this[USER_DEFINED_TABLE_NAME] || this.name;
  }

  static create() {}

  save() {}
}

class FooBar extends Record {}
