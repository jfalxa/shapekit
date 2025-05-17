import { track } from "../utils/track";
import { Path } from "./path";

export abstract class Segment {
  path?: Path;
  previous?: Segment;

  constructor(public x: number, public y: number) {}
}

function markPathDirty(segment: Segment) {
  if (segment.path?.shape) segment.path.shape.__cache.dirtyPath = true;
}

export function trackSegment(Class: Function, props: string[]) {
  track(Class.prototype, props, markPathDirty);
}

trackSegment(Segment, ["x", "y"]);
