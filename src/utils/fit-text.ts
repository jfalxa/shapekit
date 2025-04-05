import { Text } from "../shapes/text";

const textCanvas = document.createElement("canvas");
const textCtx = textCanvas.getContext("2d")!;

export function fitText(text: Text): [string, number][] {
  const lines: [string, number][] = [];
  const words = (text.text ?? "").split(" ");

  let line = "";
  let width = 0;

  let maxWidth = text.obb.width - 2 * (text.padding ?? 0);

  const { font } = text;
  if (font !== textCtx.font) textCtx.font = font;

  for (const word of words) {
    const testLine = `${line} ${word}`;
    const testWidth = textCtx.measureText(testLine).width;

    if (testWidth > maxWidth) {
      lines.push([line, width]);
      line = "";
      width = 0;
    } else {
      line = testLine;
      width = testWidth;
    }
  }

  if (line.length > 0) {
    lines.push([line, width]);
  }

  return lines;
}
