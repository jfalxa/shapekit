import { Matrix3 } from "../math/mat3";
import { Point, Vec2 } from "../math/vec2";
import { Renderable } from "../shapes/renderable";

export interface AABB {
  min: Vec2;
  max: Vec2;
}

export class BoundingBox {
  static EMPTY = new BoundingBox();

  // AABB
  min = new Vec2(0, 0);
  max = new Vec2(0, 0);

  // Coordinates of the four corners
  a = new Vec2(0, 0);
  b = new Vec2(0, 0);
  c = new Vec2(0, 0);
  d = new Vec2(0, 0);

  center = new Vec2(0, 0);

  get width() {
    return this.max[0] - this.min[0];
  }

  get height() {
    return this.max[1] - this.min[1];
  }

  equals(other: BoundingBox) {
    return this.min.equals(other.min) && this.max.equals(other.max);
  }

  scale(sx: number, sy: number) {
    this.a.scale(sx, sy);
    this.b.scale(sx, sy);
    this.c.scale(sx, sy);
    this.d.scale(sx, sy);

    this.min.copy(this.a).min(this.b).min(this.c).min(this.d);
    this.max.copy(this.a).max(this.b).max(this.c).max(this.d);

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  transform(matrix: Matrix3) {
    this.a.transform(matrix);
    this.b.transform(matrix);
    this.c.transform(matrix);
    this.d.transform(matrix);

    this.min.copy(this.a).min(this.b).min(this.c).min(this.d);
    this.max.copy(this.a).max(this.b).max(this.c).max(this.d);

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  merge(other: Vec2 | AABB) {
    if (other instanceof Vec2) {
      this.min.min(other);
      this.max.max(other);
    } else {
      this.min.min(other.min);
      this.max.max(other.max);
    }

    this.a.copy(this.min);
    this.b.put(this.max[0], this.min[1]);
    this.c.copy(this.max);
    this.d.put(this.min[0], this.max[1]);

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  mayContain(other: Point | Renderable) {
    if (other instanceof Renderable) {
      return (
        other.obb.min[0] >= this.min[0] &&
        other.obb.max[0] <= this.max[0] &&
        other.obb.min[1] >= this.min[1] &&
        other.obb.max[1] <= this.max[1]
      );
    } else {
      return (
        other.x > this.min[0] &&
        other.x < this.max[0] &&
        other.y > this.min[1] &&
        other.y < this.max[1]
      );
    }
  }

  mayOverlap(other: Renderable) {
    return (
      this.min[0] <= other.obb.max[0] &&
      this.max[0] >= other.obb.min[0] &&
      this.min[1] <= other.obb.max[1] &&
      this.max[1] >= other.obb.min[1]
    );
  }

  clone() {
    return new BoundingBox().copy(this);
  }

  copy(other: BoundingBox) {
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.a.copy(other.a);
    this.b.copy(other.b);
    this.c.copy(other.c);
    this.d.copy(other.d);
    this.center.copy(other.center);
    return this;
  }

  static fit(points: Vec2[], out: AABB = new BoundingBox()) {
    out.min.put(Infinity);
    out.max.put(-Infinity);

    for (const point of points) {
      out.min.min(point);
      out.max.max(point);
    }

    return out;
  }
}
