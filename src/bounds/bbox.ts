import { Matrix3 } from "../utils/mat3";
import { Vec2 } from "../utils/vec2";
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
    this._updateCorners();
    this._updateBox();
    return this;
  }

  fit(x1: number, y1: number, x2 = x1, y2 = y1) {
    const { min, max } = this;
    min.x = Math.min(min.x, x1, x2);
    min.y = Math.min(min.y, y1, y2);
    max.x = Math.max(max.x, x1, x2);
    max.y = Math.max(max.y, y1, y2);
    this._updateCorners();
    this._updateBox();
    return this;
  }

  transform(matrix: Matrix3) {
    const { a, b, c, d, min, max } = this;
    a.transform(matrix);
    b.transform(matrix);
    c.transform(matrix);
    d.transform(matrix);
    min.put(Infinity).min(a).min(b).min(c).min(d);
    max.put(-Infinity).max(a).max(b).max(c).max(d);
    this._updateBox();
    return this;
  }

  copy(other: BBox) {
    this.a.copy(other.a);
    this.b.copy(other.b);
    this.c.copy(other.c);
    this.d.copy(other.d);
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.center.copy(other.center);
    this.width = other.width;
    this.height = other.height;
    return this;
  }

  private _updateCorners() {
    const { a, b, c, d, min, max } = this;
    a.copy(min);
    b.put(max.x, min.y);
    c.copy(max);
    d.put(min.x, max.y);
  }

  private _updateBox() {
    const { a, b, c, d, center } = this;
    center.x = (a.x + c.x) / 2;
    center.y = (a.y + c.y) / 2;
    this.width = Math.hypot(b.x - a.x, b.y - a.y);
    this.height = Math.hypot(d.x - a.x, d.y - a.y);
  }
}
