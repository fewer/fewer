import Builder from "./Builder";

type Pluck = string | [string, string];

interface Context {
  table: string;
  plucked: Pluck[];
  wheres: object[];
  limit?: number;
  offset?: number;
  loads?: { [key: string]: {
    keys: [string, string];
    select: Select;
  }};
  joins?: { [key: string]: {
    keys: [string, string];
    tableName: string;
  }};
}

export default class Select extends Builder<Context> {
  pluck(...fields: Pluck[]) {
    return this.next({ plucked: [...this.context.plucked, ...fields] });
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
    const newLoads = {...existingLoads};
    newLoads[name] = {
      keys,
      select
    };

    return this.next({ loads: newLoads });
  }

  join(name: string, keys: [string, string], tableName: string) {
    const existingJoins = this.context.joins || {};
    const newJoins = {...existingJoins};
    newJoins[name] = {
      keys,
      tableName,
    };

    return this.next({ joins: newJoins });
  }
}
