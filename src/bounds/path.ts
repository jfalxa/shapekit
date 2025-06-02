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
import { Elliptic } from "../samplers/elliptic";
import { Path } from "../paths/path";
import { BBox } from "./bbox";
import { cached } from "../utils/cache";

export const getPathBBox = cached("bbox", _getPathBBox);

function _getPathBBox(path: Path, out = new BBox()) {
  out.reset();
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof ArcTo) {
      Elliptic.aabb(s, out);
    } else if (s instanceof ArcSegment) {
      Elliptic.aabb(s, out);
    } else if (s instanceof EllipseSegment) {
      Elliptic.aabb(s, out);
    } else if (s instanceof BezierCurveTo) {
      Bezier3.aabb(s, path[i - 1], out);
    } else if (s instanceof ClosePath) {
      out.fit(s.x, s.y);
    } else if (s instanceof LineTo) {
      out.fit(s.x, s.y);
    } else if (s instanceof MoveTo) {
      out.fit(s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      Bezier2.aabb(s, path[i - 1], out);
    } else if (s instanceof Rect) {
      out.fit(s.x, s.y, s.x + s.width, s.y + s.height);
    }
  }
  return out;
}
