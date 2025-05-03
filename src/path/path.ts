import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export type PathLike = Path | Array<Segment>;

export class Path extends Array<Segment> {
  path2D: Path2D;
  points: Vec2[];
  obb: BoundingBox;

  constructor(segments: Segment[]) {
    super(segments.length);
    for (let i = 0; i < segments.length; i++) this[i] = segments[i];
    this.obb = new BoundingBox();
    this.points = [];
    this.path2D = new Path2D();
  }

  scale(sx: number, sy: number) {
    for (let i = 0; i < this.length; i++) {
      this[i].scale(sx, sy);
    }
  }

  build(quality = 0.5) {
    let previousSegment: Segment | undefined;

    this.path2D = new Path2D();
    this.points.length = 0;

    for (let i = 0; i < this.length; i++) {
      const segment = this[i];
      segment.link(previousSegment);
      segment.apply(this.path2D);
      this.points.push(...segment.sample(quality));
      previousSegment = segment;
    }

    this.obb.min.put(Infinity);
    this.obb.max.put(-Infinity);

    for (let i = 0; i < this.points.length; i++) {
      this.obb.merge(this.points[i]);
    }
  }
}
