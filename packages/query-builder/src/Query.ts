import SqlString from 'sqlstring';
import { SQLike } from './types';

export default class Query implements SQLike {
  private name: string;
  private alias?: string;
  private conditions: string[];
  private aggregation?: string;

  constructor(
    name: string,
    conditions: string[] = [],
    alias?: string,
    aggregation?: string,
  ) {
    this.name = name;
    this.alias = alias;
    this.conditions = conditions;
    this.aggregation = aggregation;
  }

  private cloneWith({
    name = this.name,
    conditions = [...this.conditions],
    alias = this.alias,
    aggregation = this.aggregation,
  }): Query {
    return new Query(name, conditions, alias, aggregation);
  }

  private addCondition(
    symbol: string,
    value: string | number | (string | number)[],
  ): Query {
    return this.cloneWith({
      conditions: [...this.conditions, `${symbol} ${SqlString.escape([value])}`],
    });
  }

  private addAggregation(aggregation: string): Query {
    return this.cloneWith({ aggregation });
  }

  as(alias: string): Query {
    return this.cloneWith({ alias });
  }

  get count(): Query {
    return this.addAggregation('COUNT');
  }

  get sum(): Query {
    return this.addAggregation('SUM');
  }

  get average(): Query {
    return this.addAggregation('AVG');
  }

  get maximum(): Query {
    return this.addAggregation('MAX');
  }

  get minimum(): Query {
    return this.addAggregation('MIN');
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

  in(values: (string | number)[]): Query {
    return this.addCondition('IN', values);
  }

  toSQL(): string {
    const escapedName = SqlString.escapeId(this.name);
    const wrappedName = this.aggregation
      ? `${this.aggregation}(${escapedName})`
      : escapedName;
    return [
      wrappedName,
      this.conditions.join(' '),
      this.alias && `AS ${SqlString.escapeId(this.alias)}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
