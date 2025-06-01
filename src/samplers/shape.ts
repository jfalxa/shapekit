import { getLocalTransform } from "../transformer/local-transform";
import { Vec2 } from "../math/vec2";
import { Shape } from "../renderables/shape";
import { cached } from "../utils/cache";
import { buildPathPoints } from "./path";

export const getPoints = cached("globalPoints", _getPoints);
export const getLocalPoints = cached("localPoints", _getLocalPoints);
export const getNaturalPoints = cached("naturalPoints", _getNaturalPoints);

function _getPoints(shape: Shape, out: Vec2[] = []) {
  const naturalPoints = getNaturalPoints(shape);
  out.length = naturalPoints.length;
  for (let i = 0; i < naturalPoints.length; i++) {
    if (!out[i]) out[i] = new Vec2();
    out[i].copy(naturalPoints[i]).transform(shape.transform);
  }
  return naturalPoints;
}

function _getLocalPoints(shape: Shape, out: Vec2[] = []) {
  const naturalPoints = getNaturalPoints(shape);
  const localTransform = getLocalTransform(shape);
  out.length = naturalPoints.length;
  for (let i = 0; i < naturalPoints.length; i++) {
    if (!out[i]) out[i] = new Vec2();
    out[i].copy(naturalPoints[i]).transform(localTransform);
  }
  return naturalPoints;
}

function _getNaturalPoints(shape: Shape, out: Vec2[] = []) {
  return buildPathPoints(shape.path, shape.quality, out);
}
