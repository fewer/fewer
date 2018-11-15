import Query from './Query';
import { SQLike } from './types';

interface Dollar {
  [key: string]: Query;
}

export default class Table implements SQLike {
  private name: string;
  private projections: string[];
  private wheres: string[];
  private tails: string[];
  public $: Dollar;

  constructor(name: string) {
    this.name = name;
    this.projections = [];
    this.wheres = [];
    this.tails = [];
    this.$ = new Proxy(
      {},
      {
        get(_, prop) {
          if (typeof prop !== 'string') {
            throw new RangeError('You may only use string names.');
          }
          return new Query(`${name}.${prop}`);
        },
      },
    );
  }

  where(thing: SQLike): this {
    this.wheres.push(thing.toSQL());
    return this;
  }

  project(thing: SQLike): this {
    this.projections.push(thing.toSQL());
    return this;
  }

  take(amount: number): this {
    this.tails.push(`LIMIT ${amount}`);
    return this;
  }

  skip(amount: number): this {
    this.tails.push(`OFFSET ${amount}`);
    return this;
  }

  toSQL(): string {
    return [
      'SELECT',
      this.projections.join(', '),
      `FROM ${this.name}`,
      this.wheres.length && `WHERE ${this.wheres.join(' AND ')}`,
      ...this.tails,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
