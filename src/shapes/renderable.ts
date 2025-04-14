import { Matrix3 } from "../math/mat3";
import { Point } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Group } from "./group";
import { Shape } from "./shape";

export interface RenderableInit {
  id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  angle?: number;
}

export abstract class Renderable {
  id?: string;
  parent?: Group;

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  skewX: number; // in radians
  skewY: number; // in radians
  angle: number; // in radians

  transform: Matrix3;
  obb: BoundingBox; // transformed OBB in screen coordinates

  baseWidth;
  baseHeight;

  constructor(init: RenderableInit) {
    this.id = init.id;

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.skewX = init.skewX ?? 0;
    this.skewY = init.skewY ?? 0;
    this.angle = init.angle ?? 0;

    this.transform = new Matrix3();
    this.obb = new BoundingBox();

    this.baseWidth = 0;
    this.baseHeight = 0;
  }

  abstract contains(shape: Point | Shape): boolean;
  abstract overlaps(shape: Shape): boolean;
  abstract build(): void;

  update(rebuild = false) {
    if (rebuild) this.build();
    this.transform.setTransform(this);
    if (this.parent) this.transform.transform(this.parent.transform);
  }
}
