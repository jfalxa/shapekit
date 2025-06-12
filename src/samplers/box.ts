import { AABB } from "../bounds/aabb";
import { BBox } from "../bounds/bbox";
import { Vec2 } from "../utils/vec2";
import { Rect } from "../paths/rect";
import { RoundRect } from "../paths/round-rect";
import { Elliptic } from "./elliptic";

export class Box {
  static sampleRect(rect: Rect, out: Vec2[] = [], startIndex = out.length): number {
    return Box.sample(rect.x, rect.y, rect.width, rect.height, out, startIndex);
  }

  static sampleRoundRect(
    roundRect: RoundRect,
    quality: number,
    out: Vec2[] = [],
    startIndex = out.length
  ): number {
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

    let writeIndex = startIndex;
    
    writeIndex = Elliptic.adaptiveSample(topLeft, quality, out, writeIndex);
    writeIndex = Elliptic.adaptiveSample(topRight, quality, out, writeIndex);
    writeIndex = Elliptic.adaptiveSample(bottomRight, quality, out, writeIndex);
    writeIndex = Elliptic.adaptiveSample(bottomLeft, quality, out, writeIndex);

    if (writeIndex < out.length) {
      out[writeIndex].put(x, y + rTL);
    } else {
      out[writeIndex] = new Vec2(x, y + rTL);
    }
    writeIndex++;

    return writeIndex;
  }

  static sampleAABB({ min, max }: AABB, out: Vec2[] = []): Vec2[] {
    const width = max.x - min.x;
    const height = max.y - min.y;
    const finalLength = Box.sample(min.x, min.y, width, height, out, 0);
    out.length = finalLength;
    return out;
  }

  static sampleBBox(bbox: BBox, out: Vec2[] = []): Vec2[] {
    let writeIndex = 0;
    const points = [bbox.a, bbox.b, bbox.c, bbox.d, bbox.a];
    
    for (let i = 0; i < points.length; i++) {
      if (writeIndex < out.length) {
        out[writeIndex].put(points[i].x, points[i].y);
      } else {
        out[writeIndex] = new Vec2(points[i].x, points[i].y);
      }
      writeIndex++;
    }
    
    out.length = writeIndex;
    return out;
  }

  static sample(
    x: number,
    y: number,
    width: number,
    height: number,
    out: Vec2[] = [],
    startIndex = out.length
  ): number {
    let writeIndex = startIndex;
    
    // Add 5 points for rectangle (including closing point)
    const points = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
      [x, y]
    ];
    
    for (let i = 0; i < points.length; i++) {
      if (writeIndex < out.length) {
        out[writeIndex].put(points[i][0], points[i][1]);
      } else {
        out[writeIndex] = new Vec2(points[i][0], points[i][1]);
      }
      writeIndex++;
    }
    
    return writeIndex;
  }
}
