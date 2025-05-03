import { BoundingBox } from "../utils/bounding-box";
import { Segment } from "./segment";

export function moveTo(x: number, y: number) {
  return new MoveTo(x, y);
}

export class MoveTo extends Segment {
  apply(path: Path2D): void {
    path.moveTo(this.to.x, this.to.y);
  }

  join(aabb: BoundingBox) {
    aabb.merge(this.to);
  }
}
