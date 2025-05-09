import { Matrix3 } from "../math/mat3";
import { Point, Vec2 } from "../math/vec2";
import { Renderable } from "../renderables/renderable";

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

  width = 0;
  height = 0;
  skewX = 0;
  skewY = 0;
  rotation = 0;

  #ab = new Vec2(0, 0);
  #ad = new Vec2(0, 0);

  static isAABB(value: object): value is AABB {
    return (
      "min" in value &&
      value.min instanceof Vec2 &&
      "max" in value &&
      value.max instanceof Vec2
    );
  }

  copy(other: BoundingBox) {
    this.min.copy(other.min);
    this.max.copy(other.max);
    this.a.copy(other.a);
    this.b.copy(other.b);
    this.c.copy(other.c);
    this.d.copy(other.d);
    this.center.copy(other.center);
    this.width = other.width;
    this.height = other.height;
    this.skewX = other.skewX;
    this.skewY = other.skewY;
    this.rotation = other.rotation;
    return this;
  }

  update() {
    const { a, b, c, d } = this;

    this.center.copy(a).add(b).add(c).add(d).scale(0.25);

    const ab = this.#ab.copy(b).subtract(a);
    const ad = this.#ad.copy(d).subtract(a);

    this.rotation = Math.atan2(ab.y, ab.x);
    this.width = ab.norm();
    this.height = ab.cross(ad) / this.width;
    this.skewX = ab.dot(ad) / (this.width * this.width);
    this.skewY = 0;
  }

  transform(matrix: Matrix3) {
    this.a.transform(matrix);
    this.b.transform(matrix);
    this.c.transform(matrix);
    this.d.transform(matrix);

    this.min.copy(this.a).min(this.b).min(this.c).min(this.d);
    this.max.copy(this.a).max(this.b).max(this.c).max(this.d);

    this.update();
  }

  merge(other: Vec2 | AABB | Renderable) {
    const aabb = other instanceof Renderable ? other.obb : other;
    const min = BoundingBox.isAABB(aabb) ? aabb.min : aabb;
    const max = BoundingBox.isAABB(aabb) ? aabb.max : aabb;

    this.min.min(min);
    this.max.max(max);

    this.a.copy(this.min);
    this.b.put(this.max.x, this.min.y);
    this.c.copy(this.max);
    this.d.put(this.min.x, this.max.y);

    this.update();
  }

  contains(other: Point | AABB | Renderable) {
    const aabb = other instanceof Renderable ? other.obb : other;
    const min = BoundingBox.isAABB(aabb) ? aabb.min : aabb;
    const max = BoundingBox.isAABB(aabb) ? aabb.max : aabb;

    return (
      min.x >= this.min.x &&
      max.x <= this.max.x &&
      min.y >= this.min.y &&
      max.y <= this.max.y
    );
  }

  overlaps(other: AABB | Renderable) {
    const aabb = other instanceof Renderable ? other.obb : other;

    return (
      this.min.x <= aabb.max.x &&
      this.max.x >= aabb.min.x &&
      this.min.y <= aabb.max.y &&
      this.max.y >= aabb.min.y
    );
  }
}
