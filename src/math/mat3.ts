const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export class Matrix3 extends Float32Array {
  constructor() {
    super(9);
    this.set(IDENTITY);
  }

  // Reset to identity matrix
  identity() {
    this.set(IDENTITY);
    return this;
  }

  // Apply translation (in-place)
  translate(tx: number, ty: number) {
    // prettier-ignore
    return this.multiply(
      1, 0, 0, 
      0, 1, 0, 
      tx, ty, 1
    );
  }

  // Apply rotation (in-place)
  rotate(rad: number) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // prettier-ignore
    return this.multiply(
      c, s, 0,
      -s, c, 0, 
      0, 0, 1
    );
  }

  // Apply scaling (in-place)
  scale(sx: number, sy: number) {
    // prettier-ignore
    return this.multiply(
      sx, 0, 0, 
      0, sy, 0, 
      0, 0, 1
    );
  }

  // Multiply the current matrix by another 3x3 matrix.
  // The multiplication is in the order: this = this * m.
  multiply(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number
  ) {
    const _a = this[0];
    const _b = this[1];
    const _c = this[2];
    const _d = this[3];
    const _e = this[4];
    const _f = this[5];
    const _g = this[6];
    const _h = this[7];
    const _i = this[8];

    this[0] = _a * a + _b * d + _c * g;
    this[1] = _a * b + _b * e + _c * h;
    this[2] = _a * c + _b * f + _c * i;

    this[3] = _d * a + _e * d + _f * g;
    this[4] = _d * b + _e * e + _f * h;
    this[5] = _d * c + _e * f + _f * i;

    this[6] = _g * a + _h * d + _i * g;
    this[7] = _g * b + _h * e + _i * h;
    this[8] = _g * c + _h * f + _i * i;

    return this;
  }
}
