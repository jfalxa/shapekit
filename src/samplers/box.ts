import { AABB } from "../bounds/aabb";
import { BBox } from "../bounds/bbox";
import { Vec2 } from "../math/vec2";
import { Rect } from "../paths/rect";

export class Box {
  static sampleRect(rect: Rect, out: Vec2[] = []) {
    return Box.sample(rect.x, rect.y, rect.width, rect.height, out);
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
