import { Gradient } from "./gradient";
import { Pattern } from "./pattern";

export type Style = string | Gradient | Pattern;

export function getStyle(ctx: CanvasRenderingContext2D, color?: Style) {
  if (!color) return undefined;
  else if (typeof color === "string") return color;
  else return color.get(ctx);
}
