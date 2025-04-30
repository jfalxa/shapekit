import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Arc } from "./arc";
import { Segment } from "./segment";

export function roundRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  return new RoundRect(x, y, width, height, radius);
}

class RoundRect extends Segment {
  radii: [number, number, number, number];

  constructor(
    x: number,
    y: number,
    public width: number,
    public height: number,
    radius: number | [number, number, number, number]
  ) {
    super(x, y);

    this.radii =
      typeof radius === "number" //
        ? [radius, radius, radius, radius]
        : radius;
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
    path.roundRect(to.x, to.y, width, height, this.radii);
  }

  sample(
    _from: Vec2,
    _control: Vec2 | undefined,
    sx: number,
    sy: number,
    quality: number
  ): Vec2[] {
    const to = v(this.to).scale(sx, sy);
    const width = this.width * sx;
    const height = this.height * sy;

    const [rTL, rTR, rBR, rBL] = this.radii;

    const cTL = new Vec2(to.x + rTL, to.y + rTL);
    const cTR = new Vec2(to.x + width - rTR, to.y + rTR);
    const cBR = new Vec2(to.x + width - rBR, to.y + height - rBR);
    const cBL = new Vec2(to.x + rBL, to.y + height - rBL);

    this.points.length = 0;

    Arc.adaptiveSample(cTL, rTL, Math.PI, (3 * Math.PI) / 2, quality, this.points, 0); // prettier-ignore
    Arc.adaptiveSample(cTR, rTR, -Math.PI / 2, 0, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBR, rBR, 0, Math.PI / 2, quality, this.points, this.points.length); // prettier-ignore
    Arc.adaptiveSample(cBL, rBL, Math.PI / 2, Math.PI, quality, this.points, this.points.length); // prettier-ignore

    return this.points;
  }

  join(aabb: BoundingBox, _from: Vec2, _control: Vec2 | undefined): void {
    this.min.copy(this.to);
    this.max.copy(this.to).translate(this.width, this.height);
    aabb.merge(this);
  }
}
