import { Group } from "../renderables/group";
import { Renderable } from "../renderables/renderable";

export function walk<T = void>(
  renderable: Renderable,
  operation: (renderable: Renderable) => T
): T {
  const result = operation(renderable);
  if (result !== undefined) return result;

  if (renderable instanceof Group) {
    for (let i = 0; i < renderable.children.length; i++) {
      const child = renderable.children[i];
      const result = walk(child, operation);
      if (result !== undefined) return result;
    }
  }

  return undefined as T;
}
