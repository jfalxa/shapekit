import { PathLike } from "../paths/path";
import { RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface ClipInit extends RenderableInit {
  path: PathLike;
  fillRule?: CanvasFillRule;
}

export class Clip<T = any> extends Shape<T> {
  fillRule?: CanvasFillRule;

  constructor(init: ClipInit) {
    super(init);
    this.fillRule = init.fillRule;
  }
}
