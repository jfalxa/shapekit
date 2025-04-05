import { corner } from "./corner";
import { move } from "./move";

export function roundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  return [
    move(left, 0),
    corner(0, top, left, top, radius),
    corner(right, 0, right, top, radius),
    corner(0, bottom, right, bottom, radius),
    corner(left, 0, left, bottom, radius),
  ];
}
