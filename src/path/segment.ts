import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";

export abstract class Segment {
  to: Vec2;

  protected points: Vec2[];

  constructor(x: number, y: number, protected segments = 0) {
    this.to = new Vec2(x, y);

    this.points = new Array(segments + 1);
    for (let i = 0; i <= segments; i++) this.points[i] = new Vec2(0, 0);
    this.points[0].copy(this.to);
  }

  abstract apply(path: Path2D, control: Vec2 | undefined): void;

  sample(_: Vec2, __: Vec2 | undefined) {
    return this.points;
  }

  transform(matrix: Matrix3): void {
    this.to.transform(matrix);
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
