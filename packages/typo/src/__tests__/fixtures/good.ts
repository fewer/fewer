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