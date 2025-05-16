import { Path } from "../paths/segment";
import { RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface ClipInit extends RenderableInit {
  fillRule?: CanvasFillRule;
  path?: Path;
}

export class Clip extends Shape {
  fillRule?: CanvasFillRule;

  constructor(init: ClipInit) {
    super(init);
    this.fillRule = init.fillRule;
  }
}
