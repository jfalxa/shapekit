import { Vec2 } from "../math/vec2";
import { Shape } from "../shapes/shape";

export class BoundingBox {
  min = new Vec2(0, 0);
  max = new Vec2(0, 0);

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

  update(points: Vec2[]) {
    const { min, max } = this;

    min.put(Infinity);
    max.put(-Infinity);

    for (let i = 0; i < points.length; i++) {
      min.min(points[i]);
      max.max(points[i]);
    }

    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  merge(other: BoundingBox) {
    this.min.min(other.min);
    this.max.max(other.max);
    this.center.copy(this.min).add(this.max).scale(0.5);
  }

  contains(other: Vec2 | Shape) {
    if (other instanceof Vec2) {
      return (
        other[0] > this.min[0] &&
        other[0] < this.max[0] &&
        other[1] > this.min[1] &&
        other[1] < this.max[1]
      );
    } else {
      return (
        other.aabb.min[0] >= this.min[0] &&
        other.aabb.max[0] <= this.max[0] &&
        other.aabb.min[1] >= this.min[1] &&
        other.aabb.max[1] <= this.max[1]
      );
    }
  }

  overlaps(other: Shape) {
    return (
      this.min[0] <= other.aabb.max[0] &&
      this.max[0] >= other.aabb.min[0] &&
      this.min[1] <= other.aabb.max[1] &&
      this.max[1] >= other.aabb.min[1]
    );
  }

  clone() {
    const cloned = new BoundingBox();
    cloned.min.copy(this.min);
    cloned.max.copy(this.max);
    return cloned;
  }
}
