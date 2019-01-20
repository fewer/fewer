
// class Repository<BaseType, Wheres={}, Plucks = '@@ALL_FIELDS'> {
//   where<T>(condition: T): Repository<BaseType, Wheres & T, Plucks> {
//     return new Repository();
//   }

//   pluck<K extends keyof BaseType>(...fields: K[]): Repository<BaseType, Wheres, CreateSelectionSet<Plucks, K>> {
//     return new Repository();
//   }

//   async then(
//     onFulfilled: (
//       value: Pick<BaseType, Plucks & keyof BaseType>
//     ) => void,
//     onRejected?: (error: Error) => void,
//   ) {
//     return onFulfilled({} as Pick<BaseType, Plucks & keyof BaseType>);
//   }
// }

// type CreateSelectionSet<
//   Original,
//   Additional
// > = Original extends '@@ALL_FIELDS'
//   ? Additional
//   : Original | Additional;

// const Users: Repository<{id: number, firstName: string, lastName: string}> = new Repository();

// // export function returnString(): string {
// //   return 'hello world';
// // }

// // export function returnStringOrNumber(): string | number {
// //   return 123;
// // }

// interface SomeInterface {
//   a: number;
//   b: string;
// }

// // export function returnInterfaceType(): SomeInterface {
// //   return {
// //     a: 123,
// //     b: 'abc'
// //   };
// // }

// export async function blahblahblah() {
//   return await Users.where({}).pluck('firstName').pluck('lastName');
// }
export function returnsString() {
  return 'hello world';
}

export function returnsNumber() {
  return 123;
}

export function returnsStructure() {
  return {
    abc: 123,
    def: 'hello world',
  }
}

interface SomeInterface {
  abc: number,
  def: string,
}

export function returnsSomeInterface(): SomeInterface {
  return {
    abc: 123,
    def: 'hello world'
  }
}

interface OtherInterface {
  ghi: string[]
}

export function returnsUnionOfInterfaces(): SomeInterface | OtherInterface {
  return {
    ghi: ['hello', 'world']
  };
}

export function returnsArrayOfStrings() {
  return ['hello', 'world'];
}

export async function returnsPromiseOfString() {
  return Promise.resolve('string');
}