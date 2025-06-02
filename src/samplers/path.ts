import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Arc } from "../paths/arc";
import { Ellipse } from "../paths/ellipse";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Rect } from "../paths/rect";
import { Bezier2 } from "../samplers/bezier2";
import { Bezier3 } from "../samplers/bezier3";
import { Elliptic } from "../samplers/elliptic";
import { Vec2 } from "../math/vec2";
import { Box } from "./box";
import { Path, RoundRect } from "../paths";
import { cached } from "../utils/cache";

export const getPathPoints = cached("points", _getPathPoints);

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
