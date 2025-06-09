import { Vec2 } from "../utils/vec2";
import { Matrix3 } from "../utils/mat3";
import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { cached } from "../utils/cache";
import { Box } from "../samplers/box";
import { BBox } from "./bbox";
import { getPathBBox, getPathPoints } from "./path";

export const getLocalTransform = cached("localTransform", _getLocalTransform);
export const getCenter = cached("globalCenter", _getCenter);
export const getBBox = cached("globalBBox", _getBBox);
export const getLocalBBox = cached("localBBox", _getLocalBBox);
export const getNaturalBBox = cached("naturalBBox", _getNaturalBBox);
export const getPoints = cached("globalPoints", _getPoints);
export const getLocalPoints = cached("localPoints", _getLocalPoints);
export const getNaturalPoints = cached("naturalPoints", _getNaturalPoints);

function _getLocalTransform(renderable: Renderable, out = new Matrix3()) {
  return out.identity().compose(renderable);
}

function _getCenter(renderable: Renderable, out = new Vec2()) {
  return out.put(0).transform(renderable.transform);
}

function _getBBox(renderable: Renderable, out = new BBox()) {
  const naturalBBox = getNaturalBBox(renderable);
  return out.copy(naturalBBox).transform(renderable.transform);
}

function _getLocalBBox(renderable: Renderable, out = new BBox()) {
  const naturalBBox = getNaturalBBox(renderable);
  const localTransform = getLocalTransform(renderable);
  return out.copy(naturalBBox).transform(localTransform);
}

function _getNaturalBBox(renderable: Renderable, out = new BBox()) {
  if (renderable instanceof Shape) return getPathBBox(renderable.path);

  if (renderable instanceof Image || renderable instanceof Text) {
    out.reset().fit(0, 0, renderable.getWidth(), renderable.getHeight());
  } else if (renderable instanceof Group) {
    out.reset();
    for (let i = 0; i < renderable.children.length; i++) {
      out.merge(getLocalBBox(renderable.children[i]));
    }
  }

  return out;
}

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
    Box.sample(0, 0, renderable.getWidth(), renderable.getHeight(), out);
  }

  return out;
}
