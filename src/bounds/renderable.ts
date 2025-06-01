import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { cached } from "../utils/cache";
import { BBox } from "./bbox";
import { getLocalTransform } from "../transformer/local-transform";
import { buildPathBBox } from "./path";

export const getBBox = cached("globalBBox", _getBBox);
export const getLocalBBox = cached("localBBox", _getLocalBBox);
export const getNaturalBBox = cached("naturalBBox", _getNaturalBBox);
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
