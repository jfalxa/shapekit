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
import { Segment } from "../paths/segment";

export function buildAABB(segments: Segment[], out = new AABB()) {
  out.reset();
  let lastMoveTo: MoveTo | undefined;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (s instanceof ArcTo) {
      Arc.aabb(Arc.toArc(s, segments[i - 1]), out);
    } else if (s instanceof ArcSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof EllipseSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof BezierCurveTo) {
      Bezier3.aabb(s, out);
    } else if (s instanceof ClosePath) {
      out.mergePoints(s.x, s.y);
    } else if (s instanceof LineTo) {
      out.mergePoints(s.x, s.y);
    } else if (s instanceof MoveTo) {
      out.mergePoints(s.x, s.y);
      lastMoveTo = s;
    } else if (s instanceof QuadraticCurveTo) {
      Bezier2.aabb(s, out);
    } else if (s instanceof Rect) {
      out.mergePoints(s.x, s.y, s.x + s.width, s.y + s.height);
    }
  }
  return out;
}
