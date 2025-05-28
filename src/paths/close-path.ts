import { Segment } from "./segment";

export function closePath() {
  return new ClosePath();
}

export class ClosePath extends Segment {
  constructor(x = NaN, y = NaN) {
    super(x, y);
  }
}
