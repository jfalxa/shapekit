import { Shape } from "../renderables/shape";
import { Segment } from "./segment";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> {
  isDirty: boolean;
  path2D?: Path2D;

  constructor(segments: PathLike = [], public shape?: Shape) {
    super(segments.length);
    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
    }
    this.isDirty = true;
    this.update();
  }

  update() {
    for (let i = 0; i < this.length; i++) {
      this[i].path = this;
      this[i].previous = this[i - 1];
    }
  }
}
