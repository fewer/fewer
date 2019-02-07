import Builder from './Builder';

type Pluck = string | [string, string];

export type SelectLoad = {
  keys: [string, string];
  select: Select;
};

export type SelectJoin = {
  keys: [string, string];
  tableName: string;
  select: Select;
};

interface Context {
  table: string;
  plucked: Pluck[];
  wheres: object[];
  limit?: number;
  offset?: number;
  loads?: { [key: string]: SelectLoad };
  joins?: { [key: string]: SelectJoin };
}

export default class Select extends Builder<Context> {
  pluck(...columns: Pluck[]) {
    return this.next({ plucked: [...this.context.plucked, ...columns] });
  }

  limit(limit: number) {
    return this.next({ limit });
  }

  offset(offset: number) {
    return this.next({ offset });
  }

  where(wheres: object) {
    return this.next({ wheres: [...this.context.wheres, wheres] });
  }

  load(name: string, keys: [string, string], select: Select) {
    const existingLoads = this.context.loads || {};
    const newLoads = { ...existingLoads };
    newLoads[name] = {
      keys,
      select,
    };

    return this.next({ loads: newLoads });
  }

  join(
    name: string,
    keys: [string, string],
    tableName: string,
    select: Select,
  ) {
    const existingJoins = this.context.joins || {};
    const newJoins = { ...existingJoins };
    newJoins[name] = {
      keys,
      tableName,
      select,
    };

    return this.next({ joins: newJoins });
  }
}
