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

  constructor(
    name: string,
    projections: string[] = [],
    wheres: string[] = [],
    tails: string[] = [],
  ) {
    this.name = name;
    this.projections = projections;
    this.wheres = wheres;
    this.tails = tails;

    // TODO: Avoid re-creating this proxy for every construction:
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

  private cloneWith({
    name = this.name,
    projections = [...this.projections],
    wheres = [...this.wheres],
    tails = [...this.tails],
  }): Table {
    return new Table(name, projections, wheres, tails);
  }

  where(thing: SQLike): Table {
    return this.cloneWith({ wheres: [...this.wheres, thing.toSQL()] });
  }

  project(thing: SQLike): Table {
    return this.cloneWith({ projections: [...this.projections, thing.toSQL()] });
  }

  take(amount: number): Table {
    return this.cloneWith({ tails: [...this.tails, `LIMIT ${amount}`] });
  }

  skip(amount: number): Table {
    return this.cloneWith({ tails: [...this.tails, `OFFSET ${amount}`] });
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
