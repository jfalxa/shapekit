import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";

export abstract class Segment {
  to: Vec2;

  constructor(x: number, y: number) {
    this.to = new Vec2(x, y);
  }

  abstract apply(path: Path2D, control: Vec2 | undefined): void;
  abstract sample(from: Vec2, control: Vec2 | undefined): Vec2[];

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
