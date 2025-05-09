import { Matrix3 } from "./mat3";

export interface Point {
  x: number;
  y: number;
}

export function v(point: Point) {
  return new Vec2(point.x, point.y);
}

export class Vec2 extends Float64Array implements Point {
  static ZERO = new Vec2(0, 0);

  get x() {
    return this[0];
  }

  set x(value: number) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value: number) {
    this[1] = value;
  }

  constructor(x: number, y: number) {
    super(2);
    this[0] = x;
    this[1] = y;
  }

  add(u: Vec2) {
    this[0] += u[0];
    this[1] += u[1];
    return this;
  }

  subtract(u: Vec2) {
    this[0] -= u[0];
    this[1] -= u[1];
    return this;
  }

  multiply(u: Vec2) {
    this[0] *= u[0];
    this[1] *= u[1];
    return this;
  }

  divide(u: Vec2) {
    this[0] /= u[0];
    this[1] /= u[1];
    return this;
  }

  translate(tx: number, ty: number = tx) {
    this[0] += tx;
    this[1] += ty;
    return this;
  }

  scale(sx: number, sy: number = sx) {
    this[0] *= sx;
    this[1] *= sy;
    return this;
  }

  rotate(angle: number) {
    const x = this[0];
    const y = this[1];

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    this[0] = cos * x - sin * y;
    this[1] = sin * x + cos * y;

    return this;
  }

  skew(skx: number, sky: number = 0) {
    const x = this[0];
    const y = this[1];

    this[0] = x + y * Math.tan(skx);
    this[1] = y + x * Math.tan(sky);

    return this;
  }

  dot(u: Vec2) {
    return this[0] * u[0] + this[1] * u[1];
  }

  cross(u: Vec2) {
    return this[0] * u[1] - u[0] * this[1];
  }

  norm() {
    return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
  }

  norm2() {
    return this[0] * this[0] + this[1] * this[1];
  }

  normalize() {
    const norm = this.norm();
    if (norm < 1e-6) return this.put(0);
    else return this.scale(1 / norm);
  }

  project(u: Vec2) {
    const dot = this.dot(u);
    const norm2 = u.norm2();
    return v(u).scale(dot / norm2);
  }

  perpendicular() {
    return new Vec2(-this[1], this[0]);
  }

  equals(u: Vec2) {
    return this[0] === u[0] && this[1] === u[1];
  }

  is(x: number, y: number = x) {
    return this[0] === x && this[1] === y;
  }

  clone() {
    return new Vec2(this[0], this[1]);
  }

  copy(u: Vec2) {
    this[0] = u[0];
    this[1] = u[1];
    return this;
  }

  put(x: number, y: number = x) {
    this[0] = x;
    this[1] = y;
    return this;
  }

  apply(x: (x: number) => number, y: (y: number) => number = x) {
    this[0] = x(this[0]);
    this[1] = y(this[1]);
    return this;
  }

  min(u: Vec2) {
    this[0] = this[0] < u[0] ? this[0] : u[0];
    this[1] = this[1] < u[1] ? this[1] : u[1];
    return this;
  }

  max(u: Vec2) {
    this[0] = this[0] > u[0] ? this[0] : u[0];
    this[1] = this[1] > u[1] ? this[1] : u[1];
    return this;
  }

  clamp(min: Vec2, max: Vec2) {
    return this.max(min).min(max);
  }

  floor(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this[0] = Math.floor(this[0] * pow) / pow;
    this[1] = Math.floor(this[1] * pow) / pow;
    return this;
  }

  ceil(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this[0] = Math.ceil(this[0] * pow) / pow;
    this[1] = Math.ceil(this[1] * pow) / pow;
    return this;
  }

  round(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this[0] = Math.round(this[0] * pow) / pow;
    this[1] = Math.round(this[1] * pow) / pow;
    return this;
  }

  transform(matrix: Matrix3) {
    const x = this[0];
    const y = this[1];
    this[0] = x * matrix[0] + y * matrix[3] + matrix[6];
    this[1] = x * matrix[1] + y * matrix[4] + matrix[7];
    return this;
  }

  between(p: Vec2, q: Vec2) {
    return (
      Math.min(p[0], q[0]) <= this[0] &&
      this[0] <= Math.max(p[0], q[0]) &&
      Math.min(p[1], q[1]) <= this[1] &&
      this[1] <= Math.max(p[1], q[1])
    );
  }
}
