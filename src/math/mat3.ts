const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export class Matrix3 extends Float32Array {
  constructor() {
    super(9);
    this.set(IDENTITY);
  }

  identity() {
    this.set(IDENTITY);
    return this;
  }

  translate(tx: number, ty: number) {
    // prettier-ignore
    return this.multiply(
      1, 0, 0, 
      0, 1, 0, 
      tx, ty, 1
    );
  }

  rotate(angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    // prettier-ignore
    return this.multiply(
      c, s, 0,
      -s, c, 0, 
      0, 0, 1
    );
  }

  scale(sx: number, sy: number) {
    // prettier-ignore
    return this.multiply(
      sx, 0, 0, 
      0, sy, 0, 
      0, 0, 1
    );
  }

  setTransform(tx: number, ty: number, sx: number, sy: number, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // prettier-ignore
    this[0] = sx * cos,   this[1] = sx * sin,   this[2] = 0, 
    this[3] = -sy * sin,  this[4] = sy * cos,   this[5] = 0, 
    this[6] = tx,         this[7] = ty,         this[8] = 1;

    return this;
  }

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
    const [_a, _b, _c, _d, _e, _f, _g, _h, _i] = this;

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
