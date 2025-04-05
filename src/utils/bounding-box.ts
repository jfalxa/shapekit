import { v, Vec2 } from "../math/vec2";

export class BoundingBox {
  min = new Vec2(0, 0);
  max = new Vec2(0, 0);

  get width() {
    return this.max[0] - this.min[0];
  }

  get height() {
    return this.max[1] - this.min[1];
  }

  center() {
    return v(this.min).add(this.max).scale(0.5);
  }

  equals(other: BoundingBox) {
    return this.min.equals(other.min) && this.max.equals(other.max);
  }

  update(hull: Vec2[]) {
    const { min, max } = this;

    if (hull.length === 0) {
      min.put(0);
      max.put(0);
      return;
    }

    min.put(Infinity);
    max.put(-Infinity);

    for (let i = 0; i < hull.length; i++) {
      min.min(hull[i]);
      max.max(hull[i]);
    }
  }

  merge(other: BoundingBox) {
    this.min.min(other.min);
    this.max.max(other.max);
  }

  overlaps(other: BoundingBox) {
    return (
      this.min[0] <= other.max[0] &&
      this.max[0] >= other.min[0] &&
      this.min[1] <= other.max[1] &&
      this.max[1] >= other.min[1]
    );
  }

  clone() {
    const cloned = new BoundingBox();
    cloned.min.copy(this.min);
    cloned.max.copy(this.max);
    return cloned;
  }
}
