import { Matrix3 } from "../math/mat3";
import { Renderable } from "../renderables/renderable";
import { cached } from "../utils/cache";

export const getLocalTransform = cached("localTransform", _getLocalTransform);

function _getLocalTransform(renderable: Renderable, out = new Matrix3()) {
  return out.identity().compose(renderable);
}
