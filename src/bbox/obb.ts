import { Vec2 } from "../math/vec2";
import { AABB } from "./aabb";

export class OBB extends AABB {
  a = new Vec2();
  b = new Vec2();
  c = new Vec2();
  d = new Vec2();

  apply(transform: (point: Vec2) => void) {
    transform(this.a);
    transform(this.b);
    transform(this.c);
    transform(this.d);
    this.updateAABB();
  }

  updateAABB() {
    const { a, b, c, d } = this;
    this.min.min(a).min(b).min(c).min(d);
    this.max.max(a).max(b).max(c).max(d);
  }
}
