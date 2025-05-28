import { Path } from "../paths/path";
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
import { RoundRect } from "../paths/round-rect";

export function buildAABB(path: Path, out = new AABB()) {
  out.reset();
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    s.link(path[i - 1]);
    if (s instanceof ArcTo) {
      Arc.aabb(Arc.toCircle(s), out);
    } else if (s instanceof ArcSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof EllipseSegment) {
      Arc.aabb(s, out);
    } else if (s instanceof BezierCurveTo) {
      Bezier3.aabb(s, out);
    } else if (s instanceof ClosePath) {
      out.mergePoints(s._px, s._py, s._x, s._y);
    } else if (s instanceof LineTo) {
      out.mergePoints(s._px, s._py, s.x, s.y);
    } else if (s instanceof MoveTo) {
      out.mergePoints(s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      Bezier2.aabb(s, out);
    } else if (s instanceof Rect) {
      out.mergePoints(s.x, s.y, s.x + s.width, s.y + s.height);
    }
  }
  return out;
}

export function scale(path: Path, sx: number, sy: number) {
  if (s instanceof BezierCurveTo) {
    return new BezierCurveTo(s._cp1x * sx, s._cp1y * sy, s.cp2x * sx, s.cp2y * sy, s.x * sx, s.y * sy) // prettier-ignore
  } else if (s instanceof ClosePath) {
    return new ClosePath();
  } else if (s instanceof LineTo) {
    return new LineTo(s.x * sx, s.y * sy);
  } else if (s instanceof MoveTo) {
    return new MoveTo(s.x * sx, s.y * sy);
  } else if (s instanceof QuadraticCurveTo) {
    return new QuadraticCurveTo(s._cpx * sx, s._cpy * sy, s.x * sx, s.y * sy);
  } else if (s instanceof Rect) {
    return new Rect(s.x * sx, s.y * sy, s.width * sx, s.height * sy);
  } else if (s instanceof RoundRect) {
    return new RoundRect(s.x * sx, s.y * sy, s.width * sx, s.height * sy, s.radius); // prettier-ignore
  } else if (s instanceof EllipseSegment) {
    return new EllipseSegment(s.x * sx, s.y * sy, s.radiusX * sx, s.radiusY * sy, 0, s.startAngle, s.endAngle) // prettier-ignore
  } else if (s instanceof ArcSegment) {
    if (sx !== sy) {
      return new EllipseSegment(s.x * sx, s.y * sy, s.radius * sx, s.radius * sy, 0, s.startAngle, s.endAngle) // prettier-ignore
    } else {
      return new ArcSegment(s.x * sx, s.y * sy, s.radius * sx, s.startAngle, s.endAngle) // prettier-ignore
    }
  } else if (s instanceof ArcTo) {
    if (sx === sy) {
      const arc = Arc.toCircle(s);
      arc.x *= sx;
      arc.y *= sx;
      arc.radius *= sx;
      return arc;
    } else {
      const arc = Arc.toCircle(s);
      arc.x *= sx;
      arc.y *= sy;
      arc.radius *= sx;
      return arc;
    }
  }
}
