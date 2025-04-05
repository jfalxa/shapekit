import { Vec2 } from "../math/vec2";

export abstract class Segment {
  constructor(public x: number, public y: number) {}

  abstract apply(path: Path2D, control: Vec2 | undefined): void;
  abstract sample(from: Vec2, control: Vec2 | undefined): Vec2[];

  getEndPoint(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  getSharedControl(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  getOptionalControl(): Vec2 | undefined {
    return undefined;
  }
}
