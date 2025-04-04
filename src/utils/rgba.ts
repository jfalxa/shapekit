export type RGBA = [number, number, number, number];

const rgbaCanvas = document.createElement("canvas");
const rgbaCtx = rgbaCanvas.getContext("2d")!;

const cache: Record<string, RGBA> = {};

export function toRGBA(color: string) {
  if (color in cache) return cache[color];

  rgbaCtx.fillStyle = color;
  rgbaCtx.fillRect(0, 0, 1, 1);
  const rgba = [...rgbaCtx.getImageData(0, 0, 1, 1).data].map((v) => v / 255) as RGBA; // prettier-ignore
  cache[color] = rgba;
  return rgba;
}
