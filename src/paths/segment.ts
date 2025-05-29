import { Constructor, track } from "../utils/track";
import { Path } from "./path";

export class Segment {
  path?: Path;

  declare x: number;
  declare y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function markPathDirty(segment: Segment) {
  if (segment.path?.shape) segment.path.shape.isContentDirty = true;
}

export function trackSegment<S extends Segment>(
  Class: Constructor<S>,
  props: (keyof S)[]
) {
  track(Class, props, markPathDirty);
}

trackSegment(Segment, ["x", "y"]);
