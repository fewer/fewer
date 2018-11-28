import SqlString from 'sqlstring';
import Query from './Query';
import { SQLike } from './types';
import sql from './sql';

interface Dollar {
  [key: string]: Query;
}

interface Context {
  projections: SQLike[];
  wheres: SQLike[];
  limit?: number;
  offset?: number;
}

function getContext(context?: Context): Context {
  return {
    projections: [],
    wheres: [],
    ...context,
  };
}

export default class Table implements SQLike {
  private name: string;
  private ctx: Context;

  $: Dollar;

  constructor(name: string, ctx: Context) {
    this.name = name;
    this.ctx = getContext(ctx);

    // TODO: Avoid re-creating this proxy for every construction:
    this.$ = new Proxy(
      {},
      {
        get(_, prop) {
          // Throw away anything that isn't a string:
          if (typeof prop === 'string') {
            return new Query(`${name}.${prop}`);
          }
        },
      },
    );
  }

  private cloneWith(newCtx: Partial<Context>): Table {
    return new Table(this.name, { ...this.ctx, ...newCtx });
  }

  where(thing: SQLike): Table {
    return this.cloneWith({ wheres: [...this.ctx.wheres, thing] });
  }

  project(thing: SQLike): Table {
    return this.cloneWith({
      projections: [...this.ctx.projections, thing],
    });
  }

  take(amount: number): Table {
    return this.cloneWith({
      limit: amount,
    });
  }

  skip(amount: number): Table {
    return this.cloneWith({
      offset: amount,
    });
  }

  toSQL(): string {
    let { projections, wheres, limit, offset } = this.ctx;

    // If no projections were included, default it to *.
    if (!projections.length) {
      projections = [sql('*')];
    }

    return [
      'SELECT',
      projections.map(projection => projection.toSQL()).join(', '),
      `FROM ${SqlString.escapeId(this.name)}`,
      wheres.length && `WHERE ${wheres.map(x => x.toSQL()).join(' AND ')}`,
      limit && `LIMIT ${limit}`,
      offset && `OFFSET ${offset}`,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
