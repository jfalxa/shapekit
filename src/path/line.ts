import { Segment } from "./segment";

export function line(x: number, y: number) {
  return new Line(x, y);
}

export class Line extends Segment {
  apply(path: Path2D): void {
    path.lineTo(this.to.x, this.to.y);
  }
}
