import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function rect(x: number, y: number, width: number, height: number) {
  return new Rect(x, y, width, height);
}

export class Rect extends Segment {
  _width: number;
  _height: number;

  constructor(
    x: number,
    y: number,
    public width: number,
    public height: number
  ) {
    super(x, y);
    this._width = width;
    this._height = height;
    this.points.push(new Vec2(), new Vec2(), new Vec2(), new Vec2());
  }

  scale(sx: number, sy: number) {
    super.scale(sx, sy);
    this._width = this.width * Math.abs(sx);
    this._height = this.height * Math.abs(sy);
  }

  apply(path: Path2D): void {
    path.rect(this._to.x, this._to.y, this._width, this._height);
  }

  sample(_quality: number): Vec2[] {
    this.points[0].copy(this._to);
    this.points[1].copy(this._to).translate(this._width, 0);
    this.points[2].copy(this._to).translate(this._width, this._height);
    this.points[3].copy(this._to).translate(0, this._height);
    this.points[4].copy(this._to);

    return this.points;
  }

  aabb() {
    this.min.copy(this._to);
    this.max.copy(this._to).translate(this._width, this._height);
    return this;
  }
}
