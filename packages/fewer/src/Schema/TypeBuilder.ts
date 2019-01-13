function field<Obj extends object, T>(name: string) {
  return function<Name extends string>(name: Name): PostgresTypes<Obj & { [P in Name]: T }> {
    return {} as any;
  }
}

class PostgresTypes<Obj extends object = {}> {
  boolean = field<Obj, boolean>('boolean');
  // Numeric Types:
  int = field<Obj, number>('int');
  smallint = field<Obj, number>('smallint');
  integer = field<Obj, number>('integer');
  bigint = field<Obj, number>('bigint');
  double = field<Obj, number>('double precision');
  real = field<Obj, number>('real');
  // String types:
  char = field<Obj, string>('char');
  varchar = field<Obj, string>('varchar');
  text = field<Obj, string>('text');

  finalize(): Obj {
    return {} as any;
  }
}

const schema = new PostgresTypes()
  .integer('id')
  .varchar('foo')
  .finalize();

// function field<T = any>(type: string) {
//   return function<TT, Name extends string, Base extends object = {}>(name: Name, config?: object): TypeBuilder<TT, Base> {
//     return {} as any;
//   };
// }

// class PostgresFieldTypes {
//   // Boolean Types:
//   boolean = field<boolean>('boolean');
//   // Numeric Types:
//   int = field<number>('int');
//   smallint = field<number>('smallint');
//   integer = field<number>('integer');
//   bigint = field<number>('bigint');
//   double = field<number>('double precision');
//   real = field<number>('real');
//   // String types:
//   char = field<string>('char');
//   varchar = field<string>('varchar');
//   text = field<string>('text');
// }

// type TypeFunction<T, Base extends object, Name extends string = any> = (name: Name) => TypeBuilder<T, Base & {
//   [P in Name]: string
// }>;

// type TypeBuilder<T, Base extends object = {}> = {
//   [P in keyof T]: TypeFunction<T, Base>;
// } & {
//   finalize(): Base;
// };

// function createTypeBuilder<AdapterFieldTypes>(
//   adapterFieldTypes: AdapterFieldTypes,
// ): TypeBuilder<AdapterFieldTypes> {
//   return {} as any;
// }

// const schema = createTypeBuilder(PostgresFieldTypes)
//   .integer('id')
//   .varchar('firstName')
//   .varchar('lastName')
//   .finalize();
// // .date('birthday')
// // .timestamps();
