import { PathLike } from "../paths/path";
import { RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface MaskInit extends RenderableInit {
  fillRule?: CanvasFillRule;
  path?: PathLike;
  quality?: number;
}

export class Mask extends Shape {
  fillRule?: CanvasFillRule;

  constructor(init: MaskInit) {
    super(init);
    this.fill = "transparent";
    this.fillRule = init.fillRule;
  }
}
