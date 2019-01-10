import Builder from "./Builder";

type Pluck = string | [string, string];

interface Context {
  table: string;
  plucked: Pluck[];
  wheres: object[];
  limit?: number;
  offset?: number;
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
}
