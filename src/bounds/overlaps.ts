import { Group } from "../renderables/group";
import { Renderable } from "../renderables/renderable";
import { doPolygonsOverlap } from "../utils/polygon";
import { doPolylinesOverlap } from "../utils/polyline";
import { AABB, aabbContains } from "./aabb";
import { BBox } from "./bbox";
import { contains } from "./contains";
import { normalize, Poly } from "./normalize";
import { getBBox } from "./renderable";

export function overlaps(
  container: Renderable | BBox | AABB,
  target: Renderable | BBox | AABB
) {
  if (container instanceof Group) {
    if (!overlaps(getBBox(container), target)) return false;
    for (let i = 0; i < container.children.length; i++) {
      if (overlaps(container.children[i], target)) return true;
    }
    return false;
  }

  const c = normalize(container) as Poly;
  const t = normalize(target) as Poly;

  if (!aabbContains(c.aabb, t.aabb)) return false;
  if (c.isPolygon && doPolygonsOverlap(c.points, t.points)) return true;
  if (c.isPolyline && doPolylinesOverlap(c.points, c.lineWidth, t.points, t.lineWidth)) return true; // prettier-ignore

  return contains(container, target) || contains(target, container);
}
