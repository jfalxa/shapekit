import { getLocalTransform } from "../transformer/local-transform";
import { Vec2 } from "../math/vec2";
import { Renderable } from "../renderables/renderable";
import { cached } from "../utils/cache";
import { getPathPoints } from "./path";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { getNaturalBBox } from "../bounds/renderable";

export const getPoints = cached("globalPoints", _getPoints);
export const getLocalPoints = cached("localPoints", _getLocalPoints);
export const getNaturalPoints = cached("naturalPoints", _getNaturalPoints);

function _getPoints(renderable: Renderable, out: Vec2[] = []) {
  const naturalPoints = getNaturalPoints(renderable);
  out.length = naturalPoints.length;
  for (let i = 0; i < naturalPoints.length; i++) {
    if (!out[i]) out[i] = new Vec2();
    out[i].copy(naturalPoints[i]).transform(renderable.transform);
  }
  return out;
}

function _getLocalPoints(renderable: Renderable, out: Vec2[] = []) {
  const naturalPoints = getNaturalPoints(renderable);
  const localTransform = getLocalTransform(renderable);
  out.length = naturalPoints.length;
  for (let i = 0; i < naturalPoints.length; i++) {
    if (!out[i]) out[i] = new Vec2();
    out[i].copy(naturalPoints[i]).transform(localTransform);
  }
  return naturalPoints;
}

function _getNaturalPoints(renderable: Renderable, out: Vec2[] = []) {
  if (renderable instanceof Shape) return getPathPoints(renderable.path);

  if (renderable instanceof Text || renderable instanceof Image) {
    const { a, b, c, d } = getNaturalBBox(renderable);
    out.length = 0;
    out.push(a, b, c, d, a);
  }

  return out;
}
