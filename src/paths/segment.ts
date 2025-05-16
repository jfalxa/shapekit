import { trackDirty } from "../utils/dirty";
import { Path } from "./path";

export function markPathDirty(segment: Segment) {
  if (segment.path) segment.path.dirty = true;
}

export abstract class Segment {
  path?: Path;
  previous?: Segment;

  dirty = true;

  constructor(public x: number, public y: number) {}

  static track(...props: string[]) {
    trackDirty(this.prototype, props, markPathDirty);
  }
}

Segment.track("x", "y");
