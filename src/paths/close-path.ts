import { Segment } from "./segment";

export function closePath() {
  return new ClosePath();
}

export class ClosePath extends Segment {
  constructor() {
    super(NaN, NaN);
  }
}
