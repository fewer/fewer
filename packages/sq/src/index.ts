type Pluck = string | [string, string];

interface InsertContext {
  table: string;
  fields: object;
}

interface SelectContext {
  table: string;
  plucked: Pluck[];
  wheres: object[];
  limit?: number;
  offset?: number;
}

const DEFAULT_SELECT_CONTEXT = {
  table: '',
  plucked: [],
  wheres: [],
};

const DEFAULT_INSERT_CONTEXT = {
  table: '',
  fields: {},
};

export class Insert {
  private context: InsertContext;

  constructor(table: string, context: InsertContext = DEFAULT_INSERT_CONTEXT) {
    this.context = {
      ...context,
      table,
    };
  }

  get() {
    return this.context;
  }

  next(changes: Partial<InsertContext>) {
    return new Insert(this.context.table, {
      ...this.context,
      ...changes,
    });
  }

  set(fields: object) {
    return this.next({ fields: { ...this.context.fields, ...fields } });
  }
}

export class Select {
  private context: SelectContext;

  constructor(table: string, context: SelectContext = DEFAULT_SELECT_CONTEXT) {
    this.context = {
      ...context,
      table,
    };
  }

  get(): SelectContext {
    return this.context;
  }

  next(changes: Partial<SelectContext>) {
    return new Select(this.context.table, {
      ...this.context,
      ...changes,
    });
  }

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

export default {
  select(table: string) {
    return new Select(table);
  },
  insert(table: string) {
    return new Insert(table);
  },
  update() {},
};
