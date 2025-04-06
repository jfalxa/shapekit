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
    public segments = 10
  ) {
    super(x, y);
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
      this.segments
    );
  }

  static sampleArc(
    x: number,
    y: number,
    startAngle: number,
    endAngle: number,
    radius: number,
    segments: number
  ): Vec2[] {
    const points: Vec2[] = [];
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (angleDiff * i) / segments;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      points.push(new Vec2(px, py));
    }

    return points;
  }
}
