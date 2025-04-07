import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { Renderable } from "./renderable";
import { Shape } from "./shape";

export interface GroupInit {
  children?: Renderable[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class Group implements Renderable {
  parent?: Group;
  children: Renderable[];

  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;
  angle: number = 0;

  transformation: Matrix3;

  constructor(init: GroupInit) {
    this.children = init.children ?? [];

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.angle = init.angle ?? 0;

    this.transformation = new Matrix3();
    this.update();
  }

  contains(shape: Vec2 | Shape): boolean {
    for (const child of this.children) {
      if (child.contains(shape)) return true;
    }
    return false;
  }

  overlaps(shape: Shape): boolean {
    for (const child of this.children) {
      if (child.overlaps(shape)) return true;
    }
    return false;
  }

  update(): void {
    this.transformation.setTransform(this.x, this.y, this.scaleX, this.scaleY, this.angle); // prettier-ignore

    if (this.parent) {
      const t = this.parent.transformation;
      this.transformation.multiply(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]); // prettier-ignore
    }

    for (const child of this.children) {
      child.parent = this;
      child.update();
    }
  }
}
