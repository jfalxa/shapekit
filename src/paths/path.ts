import { Segment } from "./segment";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> {
  dirty = true;

  constructor(segments: PathLike = []) {
    super(segments.length);
    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
      this[i].path = this;
      this[i].previous = segments[i - 1];
    }
  }

  update() {}
}
