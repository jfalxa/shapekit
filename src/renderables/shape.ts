import { rect } from "../paths/rect";
import { Renderable, RenderableInit } from "./renderable";
import { Path } from "../paths/segment";
import { Style } from "../styles/style";

export interface ShapeStyle {
  fill?: Style;
  stroke?: Style;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;
  lineDash?: number[];
}

export interface ShapeInit extends RenderableInit, ShapeStyle {
  path?: Path;
}

export class Shape extends Renderable {
  path: Path;

  fill?: Style;
  stroke?: Style;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;
  lineDash?: number[];

  constructor(init: ShapeInit) {
    // by default, create a rect of width x height
    if (!init.path && init.width !== undefined && init.height !== undefined) {
      init.path = [rect(0, 0, init.width, init.height)];
    }

    super(init);

    this.path = init.path ?? [];

    this.fill = init.fill;
    this.stroke = init.stroke;
    this.lineWidth = init.lineWidth;
    this.lineCap = init.lineCap;
    this.lineJoin = init.lineJoin;
    this.lineDashOffset = init.lineDashOffset;
    this.miterLimit = init.miterLimit;
    this.shadowBlur = init.shadowBlur;
    this.shadowColor = init.shadowColor;
    this.shadowOffsetX = init.shadowOffsetX;
    this.shadowOffsetY = init.shadowOffsetY;
    this.globalAlpha = init.globalAlpha;
    this.filter = init.filter;
    this.lineDash = init.lineDash;
  }
}
