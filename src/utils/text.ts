import { Text, TextStyle } from "../renderables/text";

const textCanvas = document.createElement("canvas");
textCanvas.width = 1024;
textCanvas.height = 1024;

const textCtx = textCanvas.getContext("2d")!;

export function fitText(text: Text): [string, number, number][] {
  const {
    font,
    fontSize = 12,
    lineHeight = fontSize,
    textAlign = "left",
    textVerticalAlign = "top",
    padding = 0,
  } = text;

  const lines: [string, number, number][] = [];
  const textLines: string[] = [];
  const words = (text.text ?? "").split(" ");

  const width = text.getWidth();
  const height = text.getHeight();

  let line = "";
  let maxWidth = width - 2 * (text.padding ?? 0);

  if (font !== textCtx.font) textCtx.font = font;

  for (let i = 0; i <= words.length; i++) {
    const word = words[i] ?? "";
    const testLine = line ? `${line} ${word}`.trim() : word;
    const testWidth = textCtx.measureText(testLine).width;

    if (testWidth < maxWidth && i < words.length) {
      line = testLine;
      continue;
    }

    if (line.length > 0) textLines.push(line);
    line = word;
  }

  let x = width / 2;
  if (textAlign === "left") x = padding;
  if (textAlign === "right") x = width - padding;

  let y = 0;
  if (textVerticalAlign === "top") y = padding;
  if (textVerticalAlign === "middle") y = -height / 2;
  if (textVerticalAlign === "bottom") y = height - textLines.length * lineHeight - padding; // prettier-ignore

  for (let i = 0; i < textLines.length; i++) {
    y += lineHeight;
    const text = textLines[i];
    lines.push([text, x, y]);
  }

  return lines;
}

export function measureText(text: string, style: TextStyle) {
  const font = getFont(style);
  const { fontSize = 12, lineHeight = fontSize, padding = 0 } = style;
  if (font !== textCtx.font) textCtx.font = font;
  const width = textCtx.measureText(text ?? "").width + 2 * padding;
  const height = lineHeight + 2 * padding;
  return [Math.ceil(width), height];
}

export function getFont(style: TextStyle) {
  const {
    fontSize = 12,
    fontFamily = "serif",
    fontStyle = "normal",
    fontVariant = "normal",
    fontWeight = "normal",
  } = style;

  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`
    .replaceAll(/\s+/g, " ")
    .trim();
}
