import { Style } from "../styles/style";
import { fitText, measureText } from "../utils/text";
import { Shape, ShapeInit } from "./shape";

export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  textFill?: Style;
  textStroke?: Style;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  direction?: CanvasDirection;
  textVerticalAlign?: "top" | "middle" | "bottom";
  padding?: number;
}

export interface TextInit extends ShapeInit, TextStyle {
  text: string;
}

export class Text extends Shape {
  text: string;

  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  textFill?: Style;
  textStroke?: Style;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textVerticalAlign?: "top" | "middle" | "bottom";
  direction?: CanvasDirection;
  padding?: number;

  declare font: string;
  declare lines: string[];

  constructor(init: TextInit) {
    if (init.width === undefined && init.height === undefined) {
      [init.width, init.height] = measureText(init.text, init);
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
    this.textVerticalAlign = init.textVerticalAlign;
    this.direction = init.direction;
    this.padding = init.padding;

    this.format();
  }

  update(rebuild = false) {
    super.update(rebuild);
    this.format();
  }

  format() {
    this.font = Text.getFont(this);
    this.lines = fitText(this);
  }

  static getFont(style: TextStyle) {
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
