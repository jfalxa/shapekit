import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Arc } from "../paths/arc";
import { ClosePath } from "../paths/close-path";
import { Ellipse } from "../paths/ellipse";
import { LineTo } from "../paths/line-to";
import { MoveTo } from "../paths/move-to";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { RoundRect } from "../paths/round-rect";
import { Rect } from "../paths/rect";
import { Bezier2 } from "../samplers/bezier2";
import { Bezier3 } from "../samplers/bezier3";
import { Box } from "../samplers/box";
import { Elliptic } from "../samplers/elliptic";
import { Path } from "../paths/path";
import { BBox } from "./bbox";
import { cached } from "../utils/cache";
import { Vec2 } from "../utils/vec2";

export const getPathBBox = cached("bbox", _getPathBBox);
export const getPathPoints = cached("points", _getPathPoints);

function _getPathBBox(path: Path, out = new BBox()) {
  out.reset();
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof ArcTo || s instanceof Arc || s instanceof Ellipse) {
      Elliptic.aabb(s, out);
    } else if (s instanceof BezierCurveTo) {
      Bezier3.aabb(s, path[i - 1], out);
    } else if (s instanceof QuadraticCurveTo) {
      Bezier2.aabb(s, path[i - 1], out);
    } else if (s instanceof ClosePath) {
      out.fit(s.x, s.y);
    } else if (s instanceof LineTo) {
      out.fit(s.x, s.y);
    } else if (s instanceof MoveTo) {
      out.fit(s.x, s.y);
    } else if (s instanceof Rect) {
      out.fit(s.x, s.y, s.x + s.width, s.y + s.height);
    }
  }
  return out;
}

function _getPathPoints(path: Path, out: Vec2[] = []) {
  out.length = 0;
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof ArcTo || s instanceof Arc || s instanceof Ellipse) {
      out.push(...Elliptic.adaptiveSample(s, path.quality));
    } else if (s instanceof BezierCurveTo) {
      out.push(...Bezier3.adaptiveSample(s, path[i - 1], path.quality));
    } else if (s instanceof QuadraticCurveTo) {
      out.push(...Bezier2.adaptiveSample(s, path[i - 1], path.quality));
    } else if (s instanceof RoundRect) {
      out.push(...Box.sampleRoundRect(s, path.quality));
    } else if (s instanceof Rect) {
      out.push(...Box.sampleRect(s));
    } else {
      out.push(new Vec2(s.x, s.y));
    }
  }
  return out;
}
