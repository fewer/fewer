export function as<T>() {
  return {} as T;
}

export function buildAccepts<T>() {
  return (arg: T) => {};
}

export function accepts<T>(arg: T) {}

export const acceptsString = buildAccepts<string>();
export const acceptsNumber = buildAccepts<number>();
export const acceptsBoolean = buildAccepts<boolean>();

export const optional = {
  accepts<T>(arg?: T) {},
  acceptsString: buildAccepts<string | undefined>(),
  acceptsNumber: buildAccepts<number | undefined>(),
  acceptsBoolean: buildAccepts<boolean | undefined>(),
};
