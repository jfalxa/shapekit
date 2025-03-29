import { Point, Vec2 } from "../geometry/vec2";

export class AABB {
  min = new Vec2(0, 0);
  max = new Vec2(0, 0);

  equals(other: AABB) {
    return this.min.equals(other.min) && this.max.equals(other.max);
  }

  update(hull: Point[]) {
    const { min, max } = this;
    min.put(Infinity);
    max.put(-Infinity);

    for (let i = 0; i < hull.length; i++) {
      min.min(hull[i]);
      max.max(hull[i]);
    }
  }

  merge(other: AABB) {
    this.min.min(other.min);
    this.max.max(other.max);
  }

  overlaps(other: AABB) {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y
    );
  }

  clone() {
    const cloned = new AABB();
    cloned.min.copy(this.min);
    cloned.max.copy(this.max);
    return cloned;
  }
}
