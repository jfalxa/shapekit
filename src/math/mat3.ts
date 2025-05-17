import { Transform } from "../renderables/renderable";

export class Matrix3 extends Float64Array {
  // prettier-ignore
  static IDENTITY = [
    1, 0, 0, 
    0, 1, 0, 
    0, 0, 1
  ]

  constructor(init: ArrayLike<number> = Matrix3.IDENTITY) {
    super(init);
  }

  identity() {
    this.set(Matrix3.IDENTITY);
    return this;
  }

  copy(matrix: Matrix3) {
    this.set(matrix);
    return this;
  }

  compose(transform: Partial<Transform>) {
    const {
      x = 0,
      y = 0,
      scaleX = 1,
      scaleY = 1,
      skewX = 0,
      skewY = 0,
      rotation = 0,
    } = transform;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const tanSkewX = Math.tan(skewX);
    const tanSkewY = Math.tan(skewY);

    const a = scaleX * (cos - sin * tanSkewY);
    const b = scaleX * (sin + cos * tanSkewY);

    const c = scaleY * (cos * tanSkewX - sin);
    const d = scaleY * (sin * tanSkewX + cos);

    const e = x;
    const f = y;

    // prettier-ignore
    return this.multiply(
      a, b, 0,
      c, d, 0,
      e, f, 1
    );
  }

  transform(m: Matrix3) {
    return this.multiply(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
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
