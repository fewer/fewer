import { SQLike } from './types';

export default class Query implements SQLike {
  private name: string;
  private alias?: string;
  private conditions: string[];

  constructor(name: string, conditions: string[] = [], alias?: string) {
    this.name = name;
    this.alias = alias;
    this.conditions = conditions;
  }

  private cloneWith({
    name = this.name,
    conditions = [...this.conditions],
    alias = this.alias,
  }): Query {
    return new Query(name, conditions, alias);
  }

  private addCondition(symbol: string, value: string | number): Query {
    return this.cloneWith({
      conditions: [...this.conditions, `${symbol} '${value}'`],
    });
  }

  private wrapName(fn: string): Query {
    return this.cloneWith({ name: `${fn}(${this.name})` });
  }

  as(alias: string): Query {
    return this.cloneWith({ alias });
  }

  get count(): Query {
    return this.wrapName('COUNT');
  }

  get sum(): Query {
    return this.wrapName('SUM');
  }

  get average(): Query {
    return this.wrapName('AVG');
  }

  get maximum(): Query {
    return this.wrapName('MAX');
  }

  get minimum(): Query {
    return this.wrapName('MIN');
  }

  eq(value: string | number): Query {
    return this.addCondition('=', value);
  }

  notEq(value: string | number): Query {
    return this.addCondition('!=', value);
  }

  gt(value: number): Query {
    return this.addCondition('>', value);
  }

  lt(value: number): Query {
    return this.addCondition('<', value);
  }

  gteq(value: number): Query {
    return this.addCondition('>=', value);
  }

  lteq(value: number): Query {
    return this.addCondition('<=', value);
  }

  in(values: string[] | number[]): Query {
    return this.addCondition('IN', `(${values.join(', ')})`);
  }

  toSQL(): string {
    return [
      this.name,
      this.conditions.join(' '),
      this.alias && `AS ${this.alias}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
