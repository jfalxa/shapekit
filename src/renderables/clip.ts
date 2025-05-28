import { PathLike } from "../paths/path";
import { RenderableInit } from "./renderable";
import { LightShape } from "./light-shape";

export interface ClipInit extends RenderableInit {
  path: PathLike;
  fillRule?: CanvasFillRule;
}

export class Clip extends LightShape {
  fillRule?: CanvasFillRule;

  constructor(init: ClipInit) {
    super(init);
    this.fillRule = init.fillRule;
  }
}
