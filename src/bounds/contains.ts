import { Point, Vec2 } from "../math/vec2";
import { Group } from "../renderables/group";
import { Renderable } from "../renderables/renderable";
import { isPointInPolygon } from "./polygon";
import { isPointInPolyline } from "./polyline";
import { AABB, aabbContains } from "./aabb";
import { BBox } from "./bbox";
import { normalize, Poly } from "./normalize";

export function contains(
  container: Renderable | BBox | AABB | Poly,
  target: Renderable | BBox | AABB | Vec2 | Point | Poly
) {
  const c = normalize(container) as Poly;
  const t = normalize(target);

  if (container instanceof Group) {
    if (!aabbContains(c.aabb, t instanceof Vec2 ? t : t.aabb)) return false;
    for (let i = 0; i < container.children.length; i++) {
      if (contains(container.children[i], target)) return true;
    }
    return false;
  }

  if (t instanceof Vec2) {
    if (!aabbContains(c.aabb, t)) return false;
    if (polyContainsPoint(c, t)) return true;
  } else {
    if (!aabbContains(c.aabb, t.aabb)) return false;
    for (let i = 0; i < t.points.length; i++) {
      if (!polyContainsPoint(c, t.points[i])) return false;
    }
    return true;
  }

  return false;
}

function polyContainsPoint(poly: Poly, point: Vec2) {
  if (poly.isPolygon && isPointInPolygon(poly.points, point)) return true;
  if (poly.isPolyline && isPointInPolyline(poly.points, poly.lineWidth, point)) return true; // prettier-ignore
  return false;
}
