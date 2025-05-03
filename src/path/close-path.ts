import { Vec2 } from "../math/vec2";
import { MoveTo } from "./move-to";
import { Segment } from "./segment";

export function closePath() {
  return new ClosePath();
}

export class ClosePath extends Segment {
  constructor() {
    super(0, 0);
  }

  scale(_sx: number, _sy: number): void {}

  link(previous: Segment | undefined) {
    super.link(previous);

    let beginning: Vec2 | undefined;
    let current: Segment | undefined = this.previous;

    while (current) {
      if (current instanceof ClosePath) {
        throw new Error("Path is already closed");
      } else if (current instanceof MoveTo) {
        beginning = current.to;
        break;
      }
      current = current.previous;
    }

    if (!beginning) throw new Error("Initial moveTo is missing");
    this.to.copy(beginning);
  }

  apply(path: Path2D): void {
    path.closePath();
  }
}
