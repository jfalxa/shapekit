import { Constructor, track } from "../utils/track";
import { Path } from "./path";

export class Segment {
  path?: Path;
  previous?: Segment;

  constructor(public x: number, public y: number) {}

  link(previous: Segment | undefined) {
    this.previous = previous;
  }
}

function markPathDirty(segment: Segment) {
  if (segment.path) segment.path.isDirty = true;
}

export function trackSegment(Class: Constructor<Segment>, props: string[]) {
  track(Class, props, markPathDirty);
}

trackSegment(Segment, ["x", "y"]);
