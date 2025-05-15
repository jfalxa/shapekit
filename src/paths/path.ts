import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export type PathLike = ArrayLike<Segment>;

export class Path extends Array<Segment> {
  path2D!: Path2D;
  points = new Array<Vec2>();
  obb = new BoundingBox();

  naturalWidth!: number;
  naturalHeight!: number;

  constructor(segments: PathLike, quality?: number) {
    super(segments.length);

    for (let i = 0; i < segments.length; i++) {
      this[i] = segments[i];
    }

    this.build(quality);

    this.naturalWidth = this.obb.width;
    this.naturalHeight = this.obb.height;
  }

  resize(width: number, height: number) {
    const sx = this.naturalWidth !== 0 ? width / this.naturalWidth : 1;
    const sy = this.naturalHeight !== 0 ? height / this.naturalHeight : 1;

    for (let i = 0; i < this.length; i++) {
      this[i].scale(sx, sy);
    }
  }

  build(quality = 1) {
    let previousSegment: Segment | undefined;

    this.path2D = new Path2D();
    this.points.length = 0;

    this.obb.min.put(Infinity);
    this.obb.max.put(-Infinity);

    for (let i = 0; i < this.length; i++) {
      const segment = this[i];
      segment.link(previousSegment);
      segment.apply(this.path2D);
      this.obb.merge(segment.aabb());
      this.points.push(...segment.sample(quality));
      previousSegment = segment;
    }
  }
}
