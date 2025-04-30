import { Vec2 } from "../math/vec2";
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

  apply(path: Path2D, _control: Vec2 | undefined): void {
    path.rect(this.to.x, this.to.y, this.width, this.height);
  }

  sample(_from: Vec2, _control: Vec2 | undefined, _quality: number): Vec2[] {
    this.points[0].copy(this.to);
    this.points[1].copy(this.to).translate(this.width, 0);
    this.points[2].copy(this.to).translate(this.width, this.height);
    this.points[3].copy(this.to).translate(0, this.height);
    this.points[4].copy(this.to);

    return this.points;
  }

  join(aabb: BoundingBox, _from: Vec2, _control: Vec2 | undefined): void {
    this.min.copy(this.to);
    this.max.copy(this.to).translate(this.width, this.height);
    aabb.merge(this);
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.width *= sx;
    this.height *= sy;
  }
}
