import { Vec2 } from "../math/vec2";

export class AABB {
  min = new Vec2(+Infinity);
  max = new Vec2(-Infinity);

  reset() {
    this.min.put(+Infinity);
    this.min.put(-Infinity);
  }

  mergeAABB(other: AABB) {
    this.min.min(other.min).min(other.max);
    this.max.max(other.min).max(other.max);
  }

  mergeVector(vec: Vec2) {
    this.min.min(vec);
    this.max.max(vec);
  }

  mergePoints(x1: number, y1: number, x2 = x1, y2 = y1) {
    const { min, max } = this;
    min.x = Math.min(min.x, x1, x2);
    min.y = Math.min(min.y, y1, y2);
    max.x = Math.max(max.x, x1, x2);
    max.y = Math.max(max.y, y1, y2);
  }
}
