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

  private _text: string;
  private _fontFamily?: string;
  private _fontSize?: number;
  private _fontStretch?: string;
  private _fontStyle?: string;
  private _fontVariant?: string;
  private _fontWeight?: string;
  private _lineHeight?: number;
  private _padding?: number;

  font!: string;
  lines!: string[];

  get text() {
    return this._text;
  }
  set text(value: string) {
    this._text = value;
    this.format();
  }

  get fontFamily() {
    return this._fontFamily;
  }
  set fontFamily(value: string | undefined) {
    this._fontFamily = value;
    this.format();
  }

  get fontSize() {
    return this._fontSize;
  }
  set fontSize(value: number | undefined) {
    this._fontSize = value;
    this.format();
  }

  get fontStretch() {
    return this._fontStretch;
  }
  set fontStretch(value: string | undefined) {
    this._fontStretch = value;
    this.format();
  }

  get fontStyle() {
    return this._fontStyle;
  }
  set fontStyle(value: string | undefined) {
    this._fontStyle = value;
    this.format();
  }

  get fontVariant() {
    return this._fontVariant;
  }
  set fontVariant(value: string | undefined) {
    this._fontVariant = value;
    this.format();
  }

  get fontWeight() {
    return this._fontWeight;
  }
  set fontWeight(value: string | undefined) {
    this._fontWeight = value;
    this.format();
  }

  get lineHeight() {
    return this._lineHeight;
  }
  set lineHeight(value: number | undefined) {
    this._lineHeight = value;
    this.format();
  }

  get padding() {
    return this._padding;
  }
  set padding(value: number | undefined) {
    this._padding = value;
    this.format();
  }

  constructor(textInit: TextInit) {
    super({ ...textInit, path: textInit.path ?? new Path() });

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

    this._text = textInit.text;

    this.format();
  }

  transform() {
    super.transform();
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

    // [font-style] [font-variant] [font-weight] [font-size]/[line-height] [font-family]
    this.font =
      `${fontStyle} ${fontVariant} ${fontWeight} ${_fontSize} ${fontFamily}`
        .replaceAll(/\s+/g, " ")
        .trim();

    this.lines = fitText(this);
  }
}
