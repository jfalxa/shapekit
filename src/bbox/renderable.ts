import { Matrix3 } from "../math/mat3";
import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { cached } from "../utils/cache";
import { BoundingBox } from "./bounding-box";
import { buildPathBBox } from "./path";

export const getBBox = cached("bbox", _getBBox);
export const getLocalBBox = cached("localBBox", _getLocalBBox);
export const getNaturalBBox = cached("naturalBBox", _getNaturalBBox);
export const getLocalTransform = cached("localTransform", _getLocalTransform);

function _getBBox(renderable: Renderable, out = new BoundingBox()) {
  const naturalBBox = getNaturalBBox(renderable);
  return out.copy(naturalBBox).transform(renderable.transform);
}

function _getLocalBBox(renderable: Renderable, out = new BoundingBox()) {
  const naturalBBox = getNaturalBBox(renderable);
  const localTransform = getLocalTransform(renderable);
  return out.copy(naturalBBox).transform(localTransform);
}

function _getNaturalBBox(renderable: Renderable, out = new BoundingBox()) {
  if (renderable instanceof Image || renderable instanceof Text) {
    out.reset().fit(0, 0, renderable.width, renderable.height);
  } else if (renderable instanceof Shape) {
    buildPathBBox(renderable.path, out);
  } else if (renderable instanceof Group) {
    out.reset();
    for (let i = 0; i < renderable.children.length; i++) {
      out.merge(getLocalBBox(renderable));
    }
  }
  return out;
}

function _getLocalTransform(renderable: Renderable, out = new Matrix3()) {
  return out.identity().compose(renderable);
}
