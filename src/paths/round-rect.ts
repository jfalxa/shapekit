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
  radii: [number, number, number, number];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | [number, number, number, number]
  ) {
    super(x, y, width, height);

    this.radii =
      typeof radius === "number" //
        ? [radius, radius, radius, radius]
        : radius;
  }

  apply(path: Path2D): void {
    path.roundRect(this.to.x, this.to.y, this.width, this.height, this.radii);
  }

  sample(quality: number): Vec2[] {
    const to = this.to;
    const width = this.width;
    const height = this.height;

    const [rTL, rTR, rBR, rBL] = this.radii;

    const cTL = new Vec2(to.x + rTL, to.y + rTL);
    const cTR = new Vec2(to.x + width - rTR, to.y + rTR);
    const cBR = new Vec2(to.x + width - rBR, to.y + height - rBR);
    const cBL = new Vec2(to.x + rBL, to.y + height - rBL);

    Arc.adaptiveSample(cTL, rTL, rTL, Math.PI, (3 * Math.PI) / 2, quality, this.points, 0); // prettier-ignore
    Arc.adaptiveSample(cTR, rTR, rTR, -Math.PI / 2, 0, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBR, rBR, rBR, 0, Math.PI / 2, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBL, rBL, rBL, Math.PI / 2, Math.PI, quality, this.points, this.points.length); // prettier-ignore

    this.points.push(new Vec2(to.x, to.y + rTL));

    return this.points;
  }
}
