import { Matrix3 } from "../math/mat3";
import { Point } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Group } from "./group";
import { Shape } from "./shape";

export interface RenderableInit {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
}

export class Renderable {
  parent?: Group;

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;

  transformation: Matrix3;

  _obb: BoundingBox; // untransformed OBB for reference
  obb: BoundingBox; // transformed OBB in screen coordinates

  constructor(init: RenderableInit) {
    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.angle = init.angle ?? 0;

    this.transformation = new Matrix3();

    this._obb = new BoundingBox();
    this.obb = new BoundingBox();
  }

  contains(shape: Point | Shape) {
    return this.obb.mayContain(shape);
  }

  overlaps(shape: Shape) {
    return this.obb.mayOverlap(shape);
  }

  update(_rebuild?: boolean) {}
}
