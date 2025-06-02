import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { AABB } from "./aabb";

export class BBox implements AABB {
  a = new Vec2();
  b = new Vec2();
  c = new Vec2();
  d = new Vec2();

  min = new Vec2(+Infinity);
  max = new Vec2(-Infinity);

  center = new Vec2();

  width = 0;
  height = 0;

  reset() {
    this.min.put(+Infinity);
    this.max.put(-Infinity);
    this.width = this.height = 0;
    return this;
  }

  merge(other: AABB) {
    this.min.min(other.min).min(other.max);
    this.max.max(other.min).max(other.max);
    this.update();
    return this;
  }

  fit(x1: number, y1: number, x2 = x1, y2 = y1) {
    const { min, max } = this;
    min.x = Math.min(min.x, x1, x2);
    min.y = Math.min(min.y, y1, y2);
    max.x = Math.max(max.x, x1, x2);
    max.y = Math.max(max.y, y1, y2);
    this.update();
    return this;
  }

  transform(matrix: Matrix3) {
    const { a, b, c, d, min, max } = this;
    a.transform(matrix);
    b.transform(matrix);
    c.transform(matrix);
    d.transform(matrix);
    min.min(a).min(b).min(c).min(d);
    max.max(a).max(b).max(c).max(d);
    this.update();
    return this;
  }

  isAABB() {
    const { a, b, c, d } = this;
    return a.x === d.x && a.y === b.y && c.x === b.x && c.y === d.y;
  }

  copy(other: BBox) {
    this.a.copy(other.a);
    this.b.copy(other.b);
    this.c.copy(other.c);
    this.d.copy(other.d);
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.width = other.width;
    this.height = other.height;
    return this;
  }

  update() {
    const { a, c, min, max, center } = this;
    center.x = (a.x + c.x) / 2;
    center.y = (a.y + c.y) / 2;
    this.width = max.x - min.x;
    this.height = max.y - min.y;
  }
}
