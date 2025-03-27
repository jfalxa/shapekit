export interface Point {
  x: number;
  y: number;
}

export function v(point: Point) {
  return new Vec2(point.x, point.y);
}

export class Vec2 {
  static ZERO = new Vec2(0, 0);

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(u: Point) {
    this.x += u.x;
    this.y += u.y;
    return this;
  }

  subtract(u: Point) {
    this.x -= u.x;
    this.y -= u.y;
    return this;
  }

  multiply(u: Point) {
    this.x *= u.x;
    this.y *= u.y;
    return this;
  }

  divide(u: Point) {
    this.x /= u.x;
    this.y /= u.y;
    return this;
  }

  translate(x: number, y: number = x) {
    this.x += x;
    this.y += y;
    return this;
  }

  scale(x: number, y: number = x, anchor: Point = Vec2.ZERO) {
    const deltaX = this.x - anchor.x;
    const deltaY = this.y - anchor.y;

    const scaledX = deltaX * x;
    const scaledY = deltaY * y;

    this.x = scaledX + anchor.x;
    this.y = scaledY + anchor.y;

    return this;
  }

  rotate(angle: number, anchor: Point = Vec2.ZERO) {
    const x = this.x - anchor.x;
    const y = this.y - anchor.y;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    this.x = cos * x - sin * y + anchor.x;
    this.y = sin * x + cos * y + anchor.y;

    return this;
  }

  dot(u: Point) {
    return this.x * u.x + this.y * u.y;
  }

  cross(u: Point) {
    return this.x * u.y - u.x * this.y;
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  norm2() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    if (this.is(0)) return new Vec2(0, 0);
    else return this.scale(1 / this.norm());
  }

  project(u: Vec2) {
    const dot = this.dot(u);
    const norm2 = u.norm2();
    return v(u).scale(dot / norm2);
  }

  normal() {
    return new Vec2(-this.y, this.x);
  }

  equals(u: Point) {
    return this.x === u.x && this.y === u.y;
  }

  is(x: number, y: number = x) {
    return this.x === x && this.y === y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  copy(u: Point) {
    this.x = u.x;
    this.y = u.y;
    return this;
  }

  set(x: number, y: number = x) {
    this.x = x;
    this.y = y;
    return this;
  }

  apply(x: (x: number) => number, y: (y: number) => number = x) {
    this.x = x(this.x);
    this.y = y(this.y);
    return this;
  }

  min(u: Point) {
    this.x = Math.min(this.x, u.x);
    this.y = Math.min(this.y, u.y);
    return this;
  }

  max(u: Point) {
    this.x = Math.max(this.x, u.x);
    this.y = Math.max(this.y, u.y);
    return this;
  }

  clamp(min: Point, max: Point) {
    return this.max(min).min(max);
  }

  floor(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this.x = Math.floor(this.x * pow) / pow;
    this.y = Math.floor(this.y * pow) / pow;
    return this;
  }

  ceil(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this.x = Math.ceil(this.x * pow) / pow;
    this.y = Math.ceil(this.y * pow) / pow;
    return this;
  }

  round(precision: number = 0) {
    const pow = Math.pow(10, precision);
    this.x = Math.round(this.x * pow) / pow;
    this.y = Math.round(this.y * pow) / pow;
    return this;
  }
}
