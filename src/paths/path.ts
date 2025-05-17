import { Dirty } from "../utils/dirty";
import { Segment } from "./segment";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> implements Dirty {
  __dirty = true;

  constructor(segments: PathLike = []) {
    super(segments.length);
    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
    }
    this.update();
  }

  update() {
    for (let i = 0; i < this.length; i++) {
      this[i].path = this;
      this[i].previous = this[i - 1];
    }
  }
}
