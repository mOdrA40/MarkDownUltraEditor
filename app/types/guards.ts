/**
 * @fileoverview Type Guards and Runtime Type Checking
 * @author Axel Modra
 */

/**
 * Utility type for checking if a value is not null or undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Utility type for making specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for making specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for deep readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Utility type for extracting function parameters
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Utility type for extracting function return type
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : unknown;

/**
 * Type guard for checking if value is string
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard for checking if value is number
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value);
};

/**
 * Type guard for checking if value is boolean
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * Type guard for checking if value is object (not null, not array)
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Type guard for checking if value is array
 */
export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

/**
 * Type guard for checking if value is function
 */
export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
  return typeof value === 'function';
};

/**
 * Type guard for checking if value is not null or undefined
 */
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Type guard for checking if value is null or undefined
 */
export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Type guard for checking if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: unknown): boolean => {
  if (isNullish(value)) return true;
  if (isString(value)) return value.length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

/**
 * Type guard for checking if value has specific property
 */
export const hasProperty = <T extends Record<string, unknown>, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> => {
  return key in obj;
};

/**
 * Type guard for checking if value is valid email
 */
export const isValidEmail = (value: unknown): value is string => {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Type guard for checking if value is valid URL
 */
export const isValidUrl = (value: unknown): value is string => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Type guard for checking if value is valid JSON string
 */
export const isValidJson = (value: unknown): value is string => {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Type guard for checking if value is valid date
 */
export const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.getTime());
};

/**
 * Type guard for checking if value is valid hex color
 */
export const isValidHexColor = (value: unknown): value is string => {
  if (!isString(value)) return false;
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(value);
};

/**
 * Type guard for checking if value is DOM element
 */
export const isDOMElement = (value: unknown): value is Element => {
  return value instanceof Element;
};

/**
 * Type guard for checking if value is HTML element
 */
export const isHTMLElement = (value: unknown): value is HTMLElement => {
  return value instanceof HTMLElement;
};

/**
 * Type guard for checking if value is Error
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

/**
 * Type guard for checking if value is Promise
 */
export const isPromise = <T>(value: unknown): value is Promise<T> => {
  return (
    value instanceof Promise ||
    (isObject(value) && isFunction((value as Record<string, unknown>).then))
  );
};

/**
 * Type guard for checking if value matches specific type pattern
 */
export const matchesPattern = <T>(
  value: unknown,
  pattern: (val: unknown) => val is T
): value is T => {
  return pattern(value);
};

/**
 * Assertion function for ensuring value is not null or undefined
 */
export const assertNotNullish = <T>(
  value: T | null | undefined,
  message = 'Value is null or undefined'
): asserts value is T => {
  if (isNullish(value)) {
    throw new Error(message);
  }
};

/**
 * Assertion function for ensuring value is string
 */
export const assertString = (
  value: unknown,
  message = 'Value is not a string'
): asserts value is string => {
  if (!isString(value)) {
    throw new Error(message);
  }
};

/**
 * Assertion function for ensuring value is number
 */
export const assertNumber = (
  value: unknown,
  message = 'Value is not a number'
): asserts value is number => {
  if (!isNumber(value)) {
    throw new Error(message);
  }
};

/**
 * Assertion function for ensuring value is object
 */
export const assertObject = (
  value: unknown,
  message = 'Value is not an object'
): asserts value is Record<string, unknown> => {
  if (!isObject(value)) {
    throw new Error(message);
  }
};

/**
 * Safe type casting with validation
 */
export const safeCast = <T>(value: unknown, guard: (val: unknown) => val is T, fallback: T): T => {
  return guard(value) ? value : fallback;
};

/**
 * Type-safe object property access
 */
export const safeGet = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K,
  fallback?: T[K]
): T[K] | undefined => {
  return hasProperty(obj, key as string) ? obj[key] : fallback;
};

/**
 * Type-safe array access
 */
export const safeArrayGet = <T>(array: T[], index: number, fallback?: T): T | undefined => {
  return index >= 0 && index < array.length ? array[index] : fallback;
};
