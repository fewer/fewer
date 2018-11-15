interface QueryBuilder {
  where(): void
}

interface IScopes {
  [key: string]: (this: QueryBuilder, ...args: any[]) => any;
}

interface RecordClass<Config, Instance> {
  new (config: Config | ((instance: Partial<Config>) => void)): Instance;
  create(config: Config): Instance;
  withScopes<Scopes extends IScopes>(scopes: Scopes): RecordClass<Config, Instance> & Scopes;
}

interface RecordInstance {
  save(): Promise<boolean>;
}

export function createRecordType<Config>(tableName: string) {
  // Configure the types up front:
  type Instance = Config & RecordInstance;
  type Class = RecordClass<Config, Instance>;

  type ConstructorArguments = Config | ((instance: Partial<Config>) => void);

  const InternalClass = function(
    this: Class,
    params: ConstructorArguments,
  ) {
    if (typeof params === 'function') {
      // @ts-ignore This is intentally type unsafe.
      params(this);
    } else {
      Object.assign(this, params);
    }
  } as any;

  // This is an intentional type unsafe conversion to allow TS to know the function we created
  // will actually match the class:

  InternalClass.create = (params: Config)  => {
    return new InternalClass(params);
  };

  InternalClass.withScopes = function<Scopes extends IScopes>(scopes: Scopes) {
    type Instance = Config & RecordInstance;
    type Class = RecordClass<Config, Instance> & Scopes;

    Object.entries(scopes).forEach(([scopeKey, scopeValue]) => {
      InternalClass[scopeKey] = scopeValue;
    });

    return InternalClass as unknown as Class;
  }

  return InternalClass as Class;
}
