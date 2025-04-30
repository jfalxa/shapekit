import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export function rect(x: number, y: number, width: number, height: number) {
  return new Rect(x, y, width, height);
}

export class Rect extends Segment {
  constructor(
    x: number,
    y: number,
    public width: number,
    public height: number
  ) {
    super(x, y);

    this.points.push(
      new Vec2(0, 0),
      new Vec2(0, 0),
      new Vec2(0, 0),
      new Vec2(0, 0)
    );
  }

  apply(
    path: Path2D,
    _control: Vec2 | undefined,
    sx: number,
    sy: number
  ): void {
    const to = v(this.to).scale(sx, sy);
    const width = this.width * sx;
    const height = this.height * sy;
    path.rect(to.x, to.y, width, height);
  }

  sample(
    _from: Vec2,
    _control: Vec2 | undefined,
    sx: number,
    sy: number,
    _quality: number
  ): Vec2[] {
    const to = v(this.to).scale(sx, sy);
    const width = this.width * sx;
    const height = this.height * sy;

    this.points[0].copy(to);
    this.points[1].copy(to).translate(width, 0);
    this.points[2].copy(to).translate(width, height);
    this.points[3].copy(to).translate(0, height);
    this.points[4].copy(to);

    return this.points;
  }

  join(aabb: BoundingBox, _from: Vec2, _control: Vec2 | undefined): void {
    this.min.copy(this.to);
    this.max.copy(this.to).translate(this.width, this.height);
    aabb.merge(this);
  }
}
