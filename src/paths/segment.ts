import { Dirty, trackDirty } from "../utils/dirty";
import { Path } from "./path";

export function markPathDirty(segment: Segment) {
  if (segment.path) segment.path.__dirty = true;
}

export abstract class Segment implements Dirty {
  path?: Path;
  previous?: Segment;

  __dirty = true;

  constructor(public x: number, public y: number) {}

  static track(...props: string[]) {
    trackDirty(this.prototype, props, markPathDirty);
  }
}

Segment.track("x", "y");
