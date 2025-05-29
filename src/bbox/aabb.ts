import { Vec2 } from "../math/vec2";

export class AABB {
  min = new Vec2(+Infinity);
  max = new Vec2(-Infinity);

  width = 0;
  height = 0;

  reset() {
    this.min.put(+Infinity);
    this.max.put(-Infinity);
    this.width = this.height = 0;
  }

  copy(aabb: AABB) {
    this.min.copy(aabb.min);
    this.max.copy(aabb.max);
    this.width = aabb.width;
    this.height = aabb.height;
  }

  mergeAABB(other: AABB) {
    this.min.min(other.min).min(other.max);
    this.max.max(other.min).max(other.max);
    this._updateDimensions();
  }

  mergeVector(vec: Vec2) {
    this.min.min(vec);
    this.max.max(vec);
    this._updateDimensions();
  }

  mergePoints(x1: number, y1: number, x2 = x1, y2 = y1) {
    const { min, max } = this;
    min.x = Math.min(min.x, x1, x2);
    min.y = Math.min(min.y, y1, y2);
    max.x = Math.max(max.x, x1, x2);
    max.y = Math.max(max.y, y1, y2);
    this._updateDimensions();
  }

  private _updateDimensions() {
    this.width = this.max.x - this.min.x;
    this.height = this.max.y - this.min.y;
  }
}
