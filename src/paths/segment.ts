import { Constructor, track } from "../utils/track";
import { markPathDirty, Path } from "./path";

export class Segment {
  path?: Path;

  declare x: number;
  declare y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function markSegmentDirty(segment: Segment) {
  if (segment.path) markPathDirty(segment.path);
}

export function trackSegment<S extends Segment>(
  Class: Constructor<S>,
  props: (keyof S)[]
) {
  track(Class, props, markSegmentDirty);
}

trackSegment(Segment, ["x", "y"]);
