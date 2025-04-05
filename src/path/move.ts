import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function move(x: number, y: number) {
  return new Move(x, y);
}

export class Move extends Segment {
  apply(path: Path2D): void {
    path.moveTo(this.x, this.y);
  }

  sample(): Vec2[] {
    return [new Vec2(this.x, this.y)];
  }
}
