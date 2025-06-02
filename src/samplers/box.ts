import { AABB } from "../bounds/aabb";
import { BBox } from "../bounds/bbox";
import { Vec2 } from "../math/vec2";
import { Rect } from "../paths/rect";
import { RoundRect } from "../paths/round-rect";
import { Elliptic } from "./elliptic";

export class Box {
  static sampleRect(rect: Rect, out: Vec2[] = []) {
    return Box.sample(rect.x, rect.y, rect.width, rect.height, out);
  }

  static sampleRoundRect(
    roundRect: RoundRect,
    quality: number,
    out: Vec2[] = []
  ) {
    const { x, y, width, height, radii } = roundRect;

    const [rTL, rTR, rBR, rBL] =
      typeof radii === "number"
        ? [radii, radii, radii, radii]
        : radii ?? [0, 0, 0, 0];

    const topLeft = {
      x: x + rTL,
      y: y + rTL,
      radiusX: rTL,
      radiusY: rTL,
      startAngle: Math.PI,
      endAngle: (3 * Math.PI) / 2,
    };

    const topRight = {
      x: x + width - rTR,
      y: y + rTL,
      radiusX: rTR,
      radiusY: rTR,
      startAngle: -Math.PI / 2,
      endAngle: 0,
    };

    const bottomRight = {
      x: x + width - rBR,
      y: y + height - rBR,
      radiusX: rBR,
      radiusY: rBR,
      startAngle: 0,
      endAngle: Math.PI / 2,
    };

    const bottomLeft = {
      x: x + rBL,
      y: y + height - rBL,
      radiusX: rBL,
      radiusY: rBL,
      startAngle: Math.PI / 2,
      endAngle: Math.PI,
    };

    out.push(
      ...Elliptic.adaptiveSample(topLeft, quality),
      ...Elliptic.adaptiveSample(topRight, quality),
      ...Elliptic.adaptiveSample(bottomRight, quality),
      ...Elliptic.adaptiveSample(bottomLeft, quality)
    );

    out.push(new Vec2(x, y + rTL));

    return out;
  }

  static sampleAABB({ min, max }: AABB, out: Vec2[] = []) {
    const width = max.x - min.x;
    const height = max.y - min.y;
    return Box.sample(min.x, min.y, width, height, out);
  }

  static sampleBBox(bbox: BBox, out: Vec2[] = []) {
    out.length = 5;
    out[0] = bbox.a;
    out[1] = bbox.b;
    out[2] = bbox.c;
    out[3] = bbox.d;
    out[4] = bbox.a;
    return out;
  }

  static sample(
    x: number,
    y: number,
    width: number,
    height: number,
    out: Vec2[] = []
  ) {
    out.length = 5;
    out[0] = new Vec2(x, y);
    out[1] = new Vec2(x + width, y);
    out[2] = new Vec2(x + width, y + height);
    out[3] = new Vec2(x, y + height);
    out[4] = new Vec2(x, y);
    return out;
  }
}
