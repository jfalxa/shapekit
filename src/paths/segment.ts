import { Constructor, track } from "../utils/track";
import { Path } from "./path";

export class Segment {
  path?: Path;

  constructor(public x: number, public y: number) {}
}

function markPathDirty(segment: Segment) {
  if (segment.path) segment.path.isDirty = true;
}

export function trackSegment(Class: Constructor<Segment>, props: string[]) {
  track(Class, props, markPathDirty);
}

trackSegment(Segment, ["x", "y"]);
