import { Segment } from "../paths/segment";
import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Arc } from "../paths/arc";
import { Ellipse } from "../paths/ellipse";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Rect } from "../paths/rect";
import { RoundRect } from "../paths/round-rect";
import { MoveTo } from "../paths/move-to";
import { LineTo } from "../paths/line-to";
import { ClosePath } from "../paths/close-path";

export function copyPath(source: Segment[], target: Segment[]) {
  for (let i = 0; i < source.length; i++) {
    const s = source[i];
    const o = target[i];

    o.x = s.x;
    o.y = s.y;

    if (s instanceof BezierCurveTo && o instanceof BezierCurveTo) {
      o.cp1x = s.cp1x;
      o.cp1y = s.cp1y;
      o.cp2x = s.cp2x;
      o.cp2y = s.cp2y;
    } else if (s instanceof QuadraticCurveTo && o instanceof QuadraticCurveTo) {
      o.cpx = s.cpx;
      o.cpy = s.cpy;
    } else if (s instanceof RoundRect && o instanceof RoundRect) {
      o.width = s.width;
      o.height = s.height;
      o.radii = s.radii;
    } else if (s instanceof Rect && o instanceof Rect) {
      o.width = s.width;
      o.height = s.height;
    } else if (s instanceof ArcTo && o instanceof ArcTo) {
      o.cpx = s.cpx;
      o.cpy = s.cpy;
      o.radiusX = s.radiusX;
      o.radiusY = s.radiusY;
    } else if (s instanceof Arc && o instanceof Arc) {
      o.radiusX = s.radiusX;
      o.radiusY = s.radiusY;
      o.startAngle = s.startAngle;
      o.endAngle = s.endAngle;
      o.counterclockwise = s.counterclockwise;
    } else if (s instanceof Ellipse && o instanceof Ellipse) {
      o.radiusX = s.radiusX;
      o.radiusY = s.radiusY;
      o.rotation = s.rotation;
      o.startAngle = s.startAngle;
      o.endAngle = s.endAngle;
      o.counterclockwise = s.counterclockwise;
    }
  }

  return target;
}

export function clonePath(segments: Segment[], out: Segment[] = []) {
  out.length = segments.length;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];

    if (s instanceof MoveTo) {
      out[i] = new MoveTo(s.x, s.y);
    } else if (s instanceof LineTo) {
      out[i] = new LineTo(s.x, s.y);
    } else if (s instanceof ClosePath) {
      out[i] = new ClosePath();
    } else if (s instanceof RoundRect) {
      out[i] = new RoundRect(s.x, s.y, s.width, s.height, s.radii);
    } else if (s instanceof Rect) {
      out[i] = new Rect(s.x, s.y, s.width, s.height);
    } else if (s instanceof ArcTo) {
      out[i] = new ArcTo(s.cpx, s.cpy, s.x, s.y, s.radiusX);
      (out[i] as ArcTo).radiusY = s.radiusY;
    } else if (s instanceof Arc) {
      out[i] = new Arc(s.x ,s.y, s.radiusX, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
      (out[i] as Arc).radiusY = s.radiusY;
    } else if (s instanceof Ellipse) {
      out[i] = new Ellipse(s.x, s.y, s.radiusX, s.radiusY, s.rotation, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
    } else if (s instanceof BezierCurveTo) {
      out[i] =
        s.cp1x !== undefined && s.cp1y !== undefined
          ? new BezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y)
          : new BezierCurveTo(s.cp2x, s.cp2y, s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      out[i] =
        s.cpx !== undefined && s.cpy !== undefined
          ? new QuadraticCurveTo(s.cpx, s.cpy, s.x, s.y)
          : new QuadraticCurveTo(s.x, s.y);
    }
  }

  return out;
}

export function scalePath(segments: Segment[], sx: number, sy: number) {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];

    s.x *= sx;
    s.y *= sy;

    if (s instanceof Rect) {
      s.width *= sx;
      s.height *= sy;
    } else if (s instanceof Ellipse) {
      s.radiusX *= sx;
      s.radiusY *= sy;
    } else if (s instanceof Arc) {
      s.radiusX *= sx;
      s.radiusY *= sy;
    } else if (s instanceof ArcTo) {
      s.cpx *= sx;
      s.cpy *= sy;
      s.radiusX *= sx;
      s.radiusY *= sy;
    } else if (s instanceof QuadraticCurveTo) {
      if (s.cpx) s.cpx *= sx;
      if (s.cpy) s.cpy *= sy;
    } else if (s instanceof BezierCurveTo) {
      if (s.cp1x) s.cp1x *= sx;
      if (s.cp1y) s.cp1y *= sy;
      s.cp2x *= sx;
      s.cp2y *= sy;
    }
  }
}
