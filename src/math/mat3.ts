import { RenderableInit } from "../shapes/renderable";

// prettier-ignore
const IDENTITY = [
  1, 0, 0, 
  0, 1, 0, 
  0, 0, 1
];

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

  transform(m: Matrix3) {
    this.multiply(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
  }

  setTransform(renderable: RenderableInit) {
    const {
      x = 0,
      y = 0,
      scaleX = 1,
      scaleY = 1,
      skewX = 0,
      skewY = 0,
      angle = 0,
    } = renderable;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const tanSkewX = Math.tan(skewX);
    const tanSkewY = Math.tan(skewY);

    this[0] = scaleX * (cos - sin * tanSkewY);
    this[1] = scaleX * (sin + cos * tanSkewY);
    this[2] = 0;

    this[3] = scaleY * (cos * tanSkewX - sin);
    this[4] = scaleY * (sin * tanSkewX + cos);
    this[5] = 0;

    this[6] = x;
    this[7] = y;
    this[8] = 1;

    return this;
  }

  decompose(out: RenderableInit = {}) {
    const [a, b, , c, d, , e, f] = this;

    out.x = e;
    out.y = f;

    out.angle = Math.atan(b / a);

    const cos = Math.cos(out.angle);
    const sin = Math.sin(out.angle);

    const scaleX = Math.hypot(a, b);
    const scaleY = -c * sin + d * cos;

    out.skewX = Math.atan((cos * c + sin * d) / scaleY);
    out.skewY = 0;

    out.width = (out.width ?? 0) * (scaleX / (out.scaleX ?? 1));
    out.height = (out.height ?? 0) * (scaleY / (out.scaleY ?? 1));

    return out;
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
