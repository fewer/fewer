import { Arelable } from './types';

export default class Query implements Arelable {
  private name: string;
  private alias?: string;
  private conditions: string[];

  constructor(root: string, name: string) {
    this.name = `${root}.${name}`;
    this.conditions = [];
  }

  private addCondition(symbol: string, value: string | number): this {
    this.conditions.push(`${symbol} '${value}'`);
    return this;
  }

  private wrapName(fn: string): this {
    this.name = `${fn}(${this.name})`;
    return this;
  }

  as(alias: string): this {
    this.alias = alias;
    return this;
  }

  get count(): this {
    return this.wrapName('COUNT');
  }

  get sum(): this {
    return this.wrapName('SUM');
  }

  get average(): this {
    return this.wrapName('AVG');
  }

  get maximum(): this {
    return this.wrapName('MAX');
  }

  get minimum(): this {
    return this.wrapName('MIN');
  }

  eq(value: string | number): this {
    return this.addCondition('=', value);
  }

  notEq(value: string | number) {
    return this.addCondition('!=', value);
  }

  gt(value: number) {
    return this.addCondition('>', value);
  }

  lt(value: number) {
    return this.addCondition('<', value);
  }

  gteq(value: number) {
    return this.addCondition('>=', value);
  }

  lteq(value: number) {
    return this.addCondition('<=', value);
  }

  in(values: string[] | number[]) {
    return this.addCondition('IN', `(${values.join(', ')})`);
  }

  toSQL() {
    return [
      this.name,
      this.conditions.join(' '),
      this.alias && `AS ${this.alias}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
