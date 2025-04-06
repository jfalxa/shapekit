import { Text } from "../shapes/text";

const textCanvas = document.createElement("canvas");
const textCtx = textCanvas.getContext("2d")!;

export function fitText(text: Text): string[] {
  const lines: string[] = [];
  const words = (text.text ?? "").split(" ");

  let line = "";

  let maxWidth = text.width - 2 * (text.padding ?? 0);

  const { font } = text;
  if (font !== textCtx.font) textCtx.font = font;

  for (const word of words) {
    const testLine = `${line} ${word}`;
    const testWidth = textCtx.measureText(testLine).width;

    if (testWidth > maxWidth) {
      lines.push(line);
      line = "";
    } else {
      line = testLine;
    }
  }

  if (line.length > 0) {
    lines.push(line);
  }

  return lines;
}
