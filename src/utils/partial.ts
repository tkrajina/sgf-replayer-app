export function assignTypesafe<T>(dest: T, fields: Partial<T>): T {
  return Object.assign(dest as {}, fields) as T;
}