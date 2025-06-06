import { Group } from "../renderables/group";
import { Renderable } from "../renderables/renderable";
import { doPolygonsOverlap } from "./polygon";
import { doPolylinesOverlap } from "./polyline";
import { AABB, aabbOverlaps } from "./aabb";
import { BBox } from "./bbox";
import { contains } from "./contains";
import { normalize, Poly } from "./normalize";

export function overlaps(
  container: Renderable | BBox | AABB,
  target: Renderable | BBox | AABB
) {
  const c = normalize(container) as Poly;
  const t = normalize(target) as Poly;

  if (container instanceof Group) {
    if (!aabbOverlaps(c.aabb, t.aabb)) return false;
    for (let i = 0; i < container.children.length; i++) {
      if (overlaps(container.children[i], target)) return true;
    }
    return false;
  }

  if (!aabbOverlaps(c.aabb, t.aabb)) return false;
  if (c.isPolygon && doPolygonsOverlap(c.points, t.points)) return true;
  if (c.isPolyline && doPolylinesOverlap(c.points, c.lineWidth, t.points, t.lineWidth)) return true; // prettier-ignore

  return contains(container, target) || contains(target, container);
}
