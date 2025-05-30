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

  skew(ax: number, ay: number) {
    const tanx = Math.tan(ax);
    const tany = Math.tan(ay);
    // prettier-ignore
    return this.multiply(
      1, tany, 0, 
      tanx, 1, 0, 
      0, 0, 1
    );
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

  decompose(out = {} as Transform) {
    const [a, b, , c, d, , e, f] = this;

    let r = Math.atan2(b, a);
    let sx = Math.hypot(a, b);
    const shear = sx !== 0 ? (a * c + b * d) / (sx * sx) : 0;
    let sy = Math.hypot(c - shear * a, d - shear * b);
    let skx = sx * sy !== 0 ? Math.atan((a * c + b * d) / (sx * sy)) : 0;

    // adjust for negative scaling
    if (a * d - b * c < 0) {
      sx = -sx;
      skx = -skx;
      r -= Math.PI;
    }

    out.x = e;
    out.y = f;
    out.rotation = r;
    out.skewX = skx;
    out.skewY = 0;
    out.scaleX = sx;
    out.scaleY = sy;

    return out;
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
