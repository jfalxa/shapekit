import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function line(x: number, y: number) {
  return new Line(x, y);
}

export class Line extends Segment {
  apply(path: Path2D): void {
    path.lineTo(this.x, this.y);
  }

  sample(): Vec2[] {
    return [new Vec2(this.x, this.y)];
  }
}
