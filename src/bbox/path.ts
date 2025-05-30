import { AABB } from "./aabb";
import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Arc as ArcSegment } from "../paths/arc";
import { ClosePath } from "../paths/close-path";
import { Ellipse as EllipseSegment } from "../paths/ellipse";
import { LineTo } from "../paths/line-to";
import { MoveTo } from "../paths/move-to";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Rect } from "../paths/rect";
import { Bezier2 } from "../samplers/bezier2";
import { Bezier3 } from "../samplers/bezier3";
import { Arc } from "../samplers/arc";
import { PathLike } from "../paths/path";

export function buildAABB(path: PathLike, out = new AABB()) {
  out.reset();
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof ArcTo) {
      Arc.aabb(s, out);
    } else if (s instanceof ArcSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof EllipseSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof BezierCurveTo) {
      Bezier3.aabb(s, path[i - 1], out);
    } else if (s instanceof ClosePath) {
      out.mergePoints(s._x, s._y);
    } else if (s instanceof LineTo) {
      out.mergePoints(s.x, s.y);
    } else if (s instanceof MoveTo) {
      out.mergePoints(s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      Bezier2.aabb(s, path[i - 1], out);
    } else if (s instanceof Rect) {
      out.mergePoints(s.x, s.y, s.x + s.width, s.y + s.height);
    }
  }
  return out;
}
