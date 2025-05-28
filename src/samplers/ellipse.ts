import { AABB } from "../bbox/aabb";
import { Vec2 } from "../math/vec2";
import { Ellipse as EllipseSegment } from "../paths/ellipse";

export class Ellipse {
  static sample(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    sweep: number,
    t: number,
    out = new Vec2()
  ) {
    const angle = startAngle + sweep * t;

    const ax = radiusX * Math.cos(angle);
    const ay = radiusY * Math.sin(angle);

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    out.x = x + ax * cos - y * sin;
    out.y = y + ay * sin + y * cos;

    return out;
  }

  static aabb(ellipse: EllipseSegment, out = new AABB()) {
    //
  }

  static adaptiveSample(
    ellipse: EllipseSegment,
    quality: number,
    out: Vec2[] = []
  ) {
    const { x, y, radiusX, radiusY, rotation, startAngle, endAngle } = ellipse;

    if (radiusX === 0 && radiusY === 0) {
      out.push(new Vec2(x, y));
      return out;
    }

    const tolerance = 1 / quality;
    const radius = Math.max(radiusX, radiusY);
    const step = 2 * Math.acos(1 - tolerance / radius);
    const span = Math.abs(endAngle - startAngle);
    const divisions = Math.ceil(span / step);

    for (let i = 0; i <= divisions; i++) {
      out.push(
        Ellipse.sample(x, y, radiusX, radiusY, rotation, startAngle, endAngle, i / divisions) // prettier-ignore
      );
    }

    return out;
  }
}
