import { Renderable, RenderableInit } from "./renderable";
import { Path, PathLike } from "../paths/path";
import { Style } from "../styles/style";
import { Segment } from "../paths/segment";

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

export interface LightShapeInit extends RenderableInit, ShapeStyle {
  path: PathLike;
}

export class LightShape extends Renderable {
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

  __path: Segment[];
  __path2D?: Path2D;

  constructor(init: LightShapeInit) {
    super(init);

    this.path = new Path(init.path, this);
    this.__path = [];

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

  update(): void {
    super.update();

    if (this.isContentDirty) {
      this.__path = this.path.scale(1, 1);
    }
  }

  clean(): void {
    super.clean();
    this.isContentDirty = false;
  }
}
