export function as<T>() {
  return {} as T;
}

export function accepts<T>() {
  return (arg: T) => {};
}

export const acceptsString = accepts<string>();
export const acceptsNumber = accepts<number>();
export const acceptsBoolean = accepts<boolean>();

export const optional = {
  acceptsString: accepts<string | undefined>(),
  acceptsNumber: accepts<number | undefined>(),
  acceptsBoolean: accepts<boolean | undefined>(),
};
