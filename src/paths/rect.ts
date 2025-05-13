import { Vec2 } from "../math/vec2";
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

    this.points.push(new Vec2(), new Vec2(), new Vec2(), new Vec2());
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
    this.width *= Math.abs(sx);
    this.height *= Math.abs(sy);
  }

  apply(path: Path2D): void {
    path.rect(this.to.x, this.to.y, this.width, this.height);
  }

  sample(_quality: number): Vec2[] {
    this.points[0].copy(this.to);
    this.points[1].copy(this.to).translate(this.width, 0);
    this.points[2].copy(this.to).translate(this.width, this.height);
    this.points[3].copy(this.to).translate(0, this.height);
    this.points[4].copy(this.to);

    return this.points;
  }

  aabb() {
    this.min.copy(this.to);
    this.max.copy(this.to).translate(this.width, this.height);
    return this;
  }
}
