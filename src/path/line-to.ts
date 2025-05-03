import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export function lineTo(x: number, y: number) {
  return new LineTo(x, y);
}

export class LineTo extends Segment {
  apply(path: Path2D): void {
    path.lineTo(this.to.x, this.to.y);
  }

  join(aabb: BoundingBox) {
    this.min.copy(this.from).min(this.to);
    this.max.copy(this.from).max(this.to);
    aabb.merge(this);
  }
}
