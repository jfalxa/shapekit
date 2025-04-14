import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";

export abstract class Segment {
  to: Vec2;

  min: Vec2;
  max: Vec2;

  protected sx: number;
  protected sy: number;

  protected points: Vec2[];

  constructor(x: number, y: number, public segments = 0) {
    this.to = new Vec2(x, y);
    this.min = v(this.to);
    this.max = v(this.to);
    this.sx = 1;
    this.sy = 1;

    this.points = new Array(segments + 1);

    for (let i = 0; i <= segments; i++) {
      this.points[i] = new Vec2(0, 0);
    }
  }

  abstract apply(path: Path2D, control: Vec2 | undefined): void;

  join(aabb: BoundingBox, _from: Vec2, _control: Vec2 | undefined) {
    this.min.put(Infinity);
    this.max.put(-Infinity);

    this.min.min(this.to);
    this.max.max(this.to);

    aabb.merge(this);
  }

  sample(_from: Vec2, _control: Vec2 | undefined) {
    this.points[0].copy(this.to).scale(this.sx, this.sy);
    return this.points;
  }

  scale(sx: number, sy: number): void {
    this.sx = sx;
    this.sy = sy;
  }

  getEndPoint(): Vec2 {
    return this.to;
  }

  getSharedControl(): Vec2 | undefined {
    return this.to;
  }

  getOptionalControl(): Vec2 | undefined {
    return undefined;
  }
}
