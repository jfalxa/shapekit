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
  let writeIndex = 0;
  
  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    if (s instanceof ArcTo || s instanceof Arc || s instanceof Ellipse) {
      writeIndex = Elliptic.adaptiveSample(s, path.quality, out, writeIndex);
    } else if (s instanceof BezierCurveTo) {
      writeIndex = Bezier3.adaptiveSample(s, path[i - 1], path.quality, out, writeIndex);
    } else if (s instanceof QuadraticCurveTo) {
      writeIndex = Bezier2.adaptiveSample(s, path[i - 1], path.quality, out, writeIndex);
    } else if (s instanceof RoundRect) {
      writeIndex = Box.sampleRoundRect(s, path.quality, out, writeIndex);
    } else if (s instanceof Rect) {
      writeIndex = Box.sampleRect(s, out, writeIndex);
    } else {
      if (writeIndex < out.length) {
        out[writeIndex].put(s.x, s.y);
      } else {
        out[writeIndex] = new Vec2(s.x, s.y);
      }
      writeIndex++;
    }
  }
  
  out.length = writeIndex;
  return out;
}
