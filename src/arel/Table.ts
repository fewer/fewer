import Query from './Query';
import { Arelable } from './types';

interface Dollar {
  [key: string]: Query;
}

export default class Table implements Arelable {
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
          return new Query(name, prop);
        },
      },
    );
  }

  where(thing: Arelable): this {
    this.wheres.push(thing.toSQL());
    return this;
  }

  project(thing: Arelable): this {
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
