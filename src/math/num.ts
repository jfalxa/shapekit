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

// Helper to solve at^2 + bt + c = 0 and return real roots in (0,1)
export function solveQuadratic(a: number, b: number, c: number): number[] {
  if (epsilon(a)) {
    if (epsilon(b)) return [];
    const t = -c / b;
    return t > 0 && t < 1 ? [t] : [];
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  const sqrtD = Math.sqrt(disc);
  const t1 = (-b + sqrtD) / (2 * a);
  const t2 = (-b - sqrtD) / (2 * a);
  const roots = [];
  if (t1 > 0 && t1 < 1) roots.push(t1);
  if (t2 > 0 && t2 < 1) roots.push(t2);
  return roots;
}
