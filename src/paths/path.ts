import { LightShape } from "../renderables/light-shape";
import { Segment } from "./segment";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> {
  isDirty: boolean;
  path2D?: Path2D;

  constructor(segments: PathLike = [], public shape?: LightShape) {
    super(segments.length);

    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
      this[i].path = this;
    }

    this.isDirty = true;
  }
}
