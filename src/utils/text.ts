import { Text } from "../shapes/text";

const textCanvas = document.createElement("canvas");
textCanvas.width = 1024;
textCanvas.height = 1024;

const textCtx = textCanvas.getContext("2d")!;

export function fitText(text: Text): string[] {
  if (!text.width) {
    return [text.text];
  }

  const lines: string[] = [];
  const words = (text.text ?? "").split(" ");

  let line = "";
  let maxWidth = text.width - 2 * (text.padding ?? 0);

  const { font } = text;
  if (font !== textCtx.font) textCtx.font = font;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = textCtx.measureText(testLine).width;

    if (testWidth >= maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line.length > 0) {
    lines.push(line);
  }

  return lines;
}

export function measureText(text: Text) {
  const { font, fontSize = 12, lineHeight = fontSize, padding = 0 } = text;
  if (font !== textCtx.font) textCtx.font = font;
  const width = textCtx.measureText(text.text).width + 2 * padding;
  const height = lineHeight + 2 * padding;
  return [Math.ceil(width), height];
}
