import { v, Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function move(x: number, y: number) {
  return new Move(x, y);
}

export class Move extends Segment {
  static #p = new Vec2(0, 0);

  apply(
    path: Path2D,
    _control: Vec2 | undefined,
    sx: number,
    sy: number
  ): void {
    const to = Move.#p.copy(this.to).scale(sx, sy);
    path.moveTo(to.x, to.y);
  }
}
