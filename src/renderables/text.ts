import { Style } from "../styles/style";
import { fitText, getFont, measureText } from "../utils/text";
import { Renderable, RenderableInit } from "./renderable";

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

export interface TextInit extends RenderableInit, TextStyle {
  text: string;
  width?: number;
  height?: number;
}

export class Text extends Renderable {
  text: string;

  width: number;
  height: number;

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

  font!: string;
  lines!: [string, number, number][];

  constructor(init: TextInit) {
    super(init);

    this.text = init.text;

    if (init.width === undefined || init.height === undefined) {
      [this.width, this.height] = measureText(this.text, init);
    } else {
      this.width = init.width;
      this.height = init.height;
    }

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

  format() {
    this.font = getFont(this);
    this.lines = fitText(this);
  }

  update() {
    super.update();
    this.format();
  }
}
