import { fitText, measureText } from "../utils/text";
import { Shape, ShapeInit } from "./shape";

export interface TextInit extends ShapeInit {
  text: string;
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

  constructor(init: TextInit) {
    if (!init.width && !init.height) {
      [init.width, init.height] = measureText(init);
    }

    super(init);

    this.text = init.text;
    this.fontFamily = init.fontFamily;
    this.fontSize = init.fontSize;
    this.fontStretch = init.fontStretch;
    this.fontStyle = init.fontStyle;
    this.fontVariant = init.fontVariant;
    this.fontWeight = init.fontWeight;
    this.lineHeight = init.lineHeight;
    this.textFill = init.textFill;
    this.textStroke = init.textStroke;
    this.textLineWidth = init.textLineWidth;
    this.textAlign = init.textAlign;
    this.textBaseline = init.textBaseline;
    this.textPosition = init.textPosition;
    this.direction = init.direction;
    this.padding = init.padding;
  }

  update(rebuild = false) {
    super.update(rebuild);
    this.format();
  }

  format() {
    this.font = Text.getFont(this);
    this.lines = fitText(this);
  }

  static getFont(style: TextInit) {
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
}
