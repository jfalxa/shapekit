import { v } from "../math/vec2";
import { Segment } from "./segment";

export function move(x: number, y: number) {
  return new Move(x, y);
}

export class Move extends Segment {
  apply(path: Path2D): void {
    const to = v(this.to).scale(this.sx, this.sy);
    path.moveTo(to.x, to.y);
  }
}
