import { PathLike } from "../paths/path";
import { RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface ClipInit extends RenderableInit {
  fillRule?: CanvasFillRule;
  path?: PathLike;
  quality?: number;
}

export class Clip extends Shape {
  fillRule?: CanvasFillRule;

  constructor(init: ClipInit) {
    super(init);
    this.fill = "transparent";
    this.fillRule = init.fillRule;
  }
}
