import { Vec2 } from "../math/vec2";

export interface AABB {
  min: Vec2;
  max: Vec2;
}

export function aabbContains(container: AABB, target: AABB | Vec2) {
  const min = target instanceof Vec2 ? target : target.min;
  const max = target instanceof Vec2 ? target : target.max;
  return (
    min.x >= container.min.x &&
    max.x <= container.max.x &&
    min.y >= container.min.y &&
    max.y <= container.max.y
  );
}
