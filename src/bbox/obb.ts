import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { AABB } from "./aabb";

export class OBB extends AABB {
  a = new Vec2();
  b = new Vec2();
  c = new Vec2();
  d = new Vec2();

  transform(matrix: Matrix3) {
    this.a.transform(matrix);
    this.b.transform(matrix);
    this.c.transform(matrix);
    this.d.transform(matrix);
    this._updateAABB();
    return this;
  }

  copy(obb: OBB | AABB) {
    this.min.copy(obb.min);
    this.max.copy(obb.max);

    if (obb instanceof OBB) {
      this.a.copy(obb.a);
      this.b.copy(obb.b);
      this.c.copy(obb.c);
      this.d.copy(obb.d);
    } else {
      this.a.copy(this.min);
      this.b.copy(this.min).translate(obb.width, 0);
      this.c.copy(this.max);
      this.d.copy(this.max).translate(-obb.width, 0);
    }

    this.width = obb.width;
    this.height = obb.height;
    return this;
  }

  private _updateAABB() {
    const { a, b, c, d } = this;
    this.min.min(a).min(b).min(c).min(d);
    this.max.max(a).max(b).max(c).max(d);
  }
}
