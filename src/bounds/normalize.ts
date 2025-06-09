import { Vec2, Point } from "../utils/vec2";
import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { Box } from "../samplers/box";
import { AABB } from "./aabb";
import { BBox } from "./bbox";
import { getBBox, getPoints } from "./renderable";

export interface Normalized {
  isPolygon: boolean;
  isPolyline: boolean;
  points: Vec2[];
  lineWidth: number;
  aabb: AABB;
}

export function normalize(
  obj: Renderable | BBox | AABB | Vec2 | Point | Normalized
): Normalized | Vec2 {
  if ("isPolyline" in obj) return obj;

  if (obj instanceof Group) {
    return {
      isPolygon: true,
      isPolyline: false,
      points: [],
      lineWidth: 0,
      aabb: getBBox(obj),
    };
  }

  if (obj instanceof Shape) {
    return {
      isPolygon: Boolean(obj.fill),
      isPolyline: Boolean(obj.stroke),
      points: getPoints(obj),
      lineWidth: obj.stroke ? obj.lineWidth ?? 1 : 0,
      aabb: getBBox(obj),
    };
  }

  if (obj instanceof Text || obj instanceof Image) {
    return {
      isPolygon: true,
      isPolyline: false,
      points: getPoints(obj),
      lineWidth: 0,
      aabb: getBBox(obj),
    };
  }

  if (obj instanceof BBox) {
    return {
      isPolygon: true,
      isPolyline: false,
      points: Box.sampleBBox(obj),
      lineWidth: 0,
      aabb: obj,
    };
  }

  if (obj instanceof Vec2) {
    return obj;
  }

  if ("min" in obj && "max" in obj) {
    return {
      isPolygon: true,
      isPolyline: false,
      points: Box.sampleAABB(obj),
      lineWidth: 0,
      aabb: obj,
    };
  }

  if (!(obj instanceof Renderable)) {
    return new Vec2(obj.x, obj.y);
  }

  throw new Error(`Object type is not supported: ${obj.constructor.name}`);
}
