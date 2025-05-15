import { Vec2 } from "../math/vec2";
import { Arc } from "./arc";
import { Rect } from "./rect";

export function roundRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return new RoundRect(x, y, width, height, radius);
}

class RoundRect extends Rect {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public radius: number | [number, number, number, number]
  ) {
    super(x, y, width, height);
  }

  apply(path: Path2D): void {
    path.roundRect(
      this._to.x,
      this._to.y,
      this._width,
      this._height,
      this.radius
    );
  }

  sample(quality: number): Vec2[] {
    const to = this._to;
    const width = this._width;
    const height = this._height;

    const [rTL, rTR, rBR, rBL] =
      typeof this.radius === "number"
        ? new Array(4).fill(this.radius)
        : this.radius;

    const cTL = new Vec2(to.x + rTL, to.y + rTL);
    const cTR = new Vec2(to.x + width - rTR, to.y + rTR);
    const cBR = new Vec2(to.x + width - rBR, to.y + height - rBR);
    const cBL = new Vec2(to.x + rBL, to.y + height - rBL);

    Arc.adaptiveSample(cTL, rTL, rTL, Math.PI, (3 * Math.PI) / 2, false, quality, this.points, 0); // prettier-ignore
    Arc.adaptiveSample(cTR, rTR, rTR, -Math.PI / 2, 0, false, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBR, rBR, rBR, 0, Math.PI / 2, false, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBL, rBL, rBL, Math.PI / 2, Math.PI, false, quality, this.points, this.points.length); // prettier-ignore

    this.points.push(new Vec2(to.x, to.y + rTL));

    return this.points;
  }
}
