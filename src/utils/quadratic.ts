// Helper to solve the quadratic (or linear if a is zero) for one dimension.
export function solveQuadratic(a: number, b: number, c: number): number[] {
  const solutions: number[] = [];
  if (Math.abs(a) < 1e-6) {
    // Linear case: b*t + c = 0 => t = -c / b
    if (Math.abs(b) > 1e-6) {
      const t = -c / b;
      solutions.push(t);
    }
  } else {
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const sqrtDisc = Math.sqrt(discriminant);
      const t1 = (-b + sqrtDisc) / (2 * a);
      const t2 = (-b - sqrtDisc) / (2 * a);
      solutions.push(t1, t2);
    }
  }
  return solutions;
}
