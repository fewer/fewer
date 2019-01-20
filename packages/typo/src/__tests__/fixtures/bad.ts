export function returnString(): string {
  return 123 as unknown as string;
}

// interface SomeInterface {
//   a: number;
//   b: string;
// }

// export function returnInterfaceType(): SomeInterface {
//   return {
//     a: 123,
//   } as SomeInterface;
// }