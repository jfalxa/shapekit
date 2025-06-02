import { Vec2, Point } from "../math/vec2";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { Box } from "../samplers/box";
import { getPoints } from "../samplers/renderable";
import { AABB } from "./aabb";
import { BBox } from "./bbox";
import { getBBox } from "./renderable";

export interface Poly {
  isPolygon: boolean;
  isPolyline: boolean;
  points: Vec2[];
  lineWidth: number;
  aabb: AABB;
}

export function normalize(
  obj: Renderable | BBox | AABB | Vec2 | Point | Poly
): Poly | Vec2 {
  if (isPoly(obj)) return obj;

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

  throw new Error("Object type is not supported");
}

function isPoly(
  obj: Renderable | BBox | AABB | Vec2 | Point | Poly
): obj is Poly {
  return "isPolygon" in obj && "isPolyline" in obj;
}
