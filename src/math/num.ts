export function epsilon(a: number, b: number) {
  return Math.abs(a - b) < 1e-8;
}

export function deg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function rad(deg: number) {
  return (deg * Math.PI) / 180;
}
