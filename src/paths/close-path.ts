import { MoveTo } from "./move-to";
import { Segment } from "./segment";

export function closePath() {
  return new ClosePath();
}

export class ClosePath extends Segment {
  _x: number;
  _y: number;

  constructor() {
    super(NaN, NaN);
    this._x = NaN;
    this._y = NaN;
  }

  link(previous: Segment | undefined): void {
    super.link(previous);

    let beginning: MoveTo | undefined;
    let current = previous;

    while (current) {
      if (current instanceof ClosePath) {
        throw new Error("Path is already closed");
      } else if (current instanceof MoveTo) {
        beginning = current;
        break;
      }
      current = current.previous;
    }

    if (!beginning) throw new Error("Initial moveTo is missing");
    this._x = beginning.x;
    this._y = beginning.y;
  }
}
