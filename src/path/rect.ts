import { line } from "./line";
import { move } from "./move";

export function rect(x: number, y: number, width: number, height: number) {
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  return [
    move(left, top),
    line(right, top),
    line(right, bottom),
    line(left, bottom),
    line(left, top),
  ];
}
