import { Gradient } from "./gradient";
import { Pattern } from "./pattern";

export type Style = string | Gradient | Pattern;

export function getStyle(ctx: CanvasRenderingContext2D, color?: Style) {
  if (!color) return undefined;
  if (typeof color === "string") return color;
  if (color instanceof Gradient) return color.get(ctx);
  if (color instanceof Pattern) return color.get(ctx);
}
