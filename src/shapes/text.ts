import { Path } from "../utils/path";
import { fitText } from "../utils/fit-text";
import { Shape, ShapeInit } from "./shape";

export interface TextInit extends Omit<ShapeInit, "path"> {
  text: string;
  path?: Path;
  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  textFill?: string;
  textStroke?: string;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textPosition?: "top" | "middle" | "bottom";
  direction?: CanvasDirection;
  padding?: number;
}

export class Text extends Shape {
  textFill?: string;
  textStroke?: string;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textPosition?: "top" | "middle" | "bottom";
  direction?: CanvasDirection;

  text: string;
  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  padding?: number;

  font!: string;
  lines!: string[];

  constructor(textInit: TextInit) {
    super({ ...textInit, path: textInit.path ?? new Path() });

    this.text = textInit.text;
    this.fontFamily = textInit.fontFamily;
    this.fontSize = textInit.fontSize;
    this.fontStretch = textInit.fontStretch;
    this.fontStyle = textInit.fontStyle;
    this.fontVariant = textInit.fontVariant;
    this.fontWeight = textInit.fontWeight;
    this.lineHeight = textInit.lineHeight;
    this.textFill = textInit.textFill;
    this.textStroke = textInit.textStroke;
    this.textLineWidth = textInit.textLineWidth;
    this.textAlign = textInit.textAlign;
    this.textBaseline = textInit.textBaseline;
    this.textPosition = textInit.textPosition;
    this.direction = textInit.direction;
    this.padding = textInit.padding;

    this.format();
  }

  update() {
    super.update();
    this.format();
  }

  format() {
    const {
      fontSize = 12,
      fontFamily = "serif",
      fontStyle = "normal",
      fontVariant = "normal",
      fontWeight = "normal",
    } = this;

    const _fontSize = fontSize + "px";

    this.font =
      `${fontStyle} ${fontVariant} ${fontWeight} ${_fontSize} ${fontFamily}`
        .replaceAll(/\s+/g, " ")
        .trim();

    this.lines = fitText(this);
  }
}
