export function epsilon(a: number, b = 0) {
  return Math.abs(a - b) < 1e-8;
}

export function set<T extends object, K extends keyof T>(
  out: T,
  key: K,
  value: number
) {
  if (!epsilon(out[key] as number, value)) {
    out[key] = value as T[K];
  }
}
