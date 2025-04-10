import { Matrix3 } from "../math/mat3";
import { Point, Vec2 } from "../math/vec2";
import { Renderable } from "../shapes/renderable";

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

  fit(points: Vec2[], lineWidth: number | undefined) {
    const { min, max } = this;

    if (points.length === 0) {
      min.put(0);
      max.put(0);
      return;
    }

    min.put(Infinity);
    max.put(-Infinity);

    for (let i = 0; i < points.length; i++) {
      min.min(points[i]);
      max.max(points[i]);
    }

    if (lineWidth) {
      const halfWidth = lineWidth / 2;
      min.translate(-halfWidth, -halfWidth);
      max.translate(halfWidth, halfWidth);
    }

    this.a.copy(min);
    this.b.put(max[0], min[1]);
    this.c.copy(max);
    this.d.put(min[0], max[1]);

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  transform(matrix: Matrix3) {
    this.a.transform(matrix);
    this.b.transform(matrix);
    this.c.transform(matrix);
    this.d.transform(matrix);

    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(this.a).min(this.b).min(this.c).min(this.d);
    this.max.max(this.a).max(this.b).max(this.c).max(this.d);

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  merge(other: BoundingBox) {
    this.min.min(other.min);
    this.max.max(other.max);

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
}
