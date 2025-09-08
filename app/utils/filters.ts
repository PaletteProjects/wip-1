export const nullish = <T>(x: T | null | undefined): x is null | undefined => x == null;
export const nonNullish = <T>(x: T | null | undefined): x is T => x != null;
export const isTrue = (x: unknown): x is true => x === true;
export const isFalse = (x: unknown): x is false => x === false;
