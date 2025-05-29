import { Constructor, track } from "../utils/track";
import { Path } from "./path";

export class Segment {
  path?: Path;

  constructor(public x: number, public y: number) {}
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
