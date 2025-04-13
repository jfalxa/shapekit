import { Vec2 } from "../math/vec2";
import { Segment } from "./segment";

export function arc(
  x: number,
  y: number,
  startAngle: number,
  endAngle: number,
  radius: number,
  counterclockwise?: boolean,
  segments = 10
) {
  return new Arc(
    x,
    y,
    startAngle,
    endAngle,
    radius,
    counterclockwise,
    segments
  );
}

export class Arc extends Segment {
  constructor(
    x: number,
    y: number,
    public startAngle: number,
    public endAngle: number,
    public radius: number,
    public counterclockwise?: boolean,
    segments = 10
  ) {
    super(x, y, segments);
  }

  apply(path: Path2D) {
    path.arc(
      this.to.x,
      this.to.y,
      this.radius,
      this.startAngle,
      this.endAngle,
      this.counterclockwise
    );
  }

  sample(): Vec2[] {
    return Arc.sampleArc(
      this.to.x,
      this.to.y,
      this.startAngle,
      this.endAngle,
      this.radius,
      this.segments,
      this.points
    );
  }

  scale(sx: number, sy: number): void {
    this.to.scale(sx, sy);
    this.radius *= Math.min(sx, sy);
  }

  static sampleArc(
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    radius: number,
    segments = 10,
    points = new Array<Vec2>(segments + 2)
  ): Vec2[] {
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (angleDiff * i) / segments;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      if (!points[i]) points[i] = new Vec2(0, 0);
      points[i].put(px, py);
    }

    return points;
  }
}
