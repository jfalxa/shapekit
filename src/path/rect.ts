import { Vec2 } from "../math/vec2";
import { move } from "./move";

export function rect(x: number, y: number, width: number, height: number) {
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  return [
    move(left, top),
    new Vec2(right, top),
    new Vec2(right, bottom),
    new Vec2(left, bottom), //
    new Vec2(left, top), //
  ];
}
