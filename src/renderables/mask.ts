import { PathLike } from "../paths/path";
import { RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface MaskInit extends RenderableInit {
  path?: PathLike;
  quality?: number;
}

export class Mask extends Shape {
  constructor(init: MaskInit) {
    super(init);
  }
}
