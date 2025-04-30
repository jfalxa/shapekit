import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function move(x: number, y: number) {
  return new Move(x, y);
}

export class Move extends Segment {
  apply(path: Path2D, _control: Vec2 | undefined): void {
    path.moveTo(this.to.x, this.to.y);
  }
}
