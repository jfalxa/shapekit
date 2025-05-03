import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function lineTo(x: number, y: number) {
  return new LineTo(x, y);
}

export class LineTo extends Segment {
  apply(path: Path2D, _control: Vec2 | undefined): void {
    path.lineTo(this.to.x, this.to.y);
  }
}
