import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
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
  children: Renderable[];

  _scaleX: number;
  _scaleY: number;
  _angle: number;

  aabb: BoundingBox;

  get x() {
    return this.aabb.center.x;
  }
  set x(value: number) {
    this.translate(value - this.aabb.center.x, 0);
  }

  get y() {
    return this.aabb.center.y;
  }
  set y(value: number) {
    this.translate(0, value - this.aabb.center.y);
  }

  get scaleX() {
    return this._scaleX;
  }
  set scaleX(value: number) {
    const oldSX = this._scaleX;
    this._scaleX = value;
    this.scale(this._scaleX / oldSX, 1);
  }

  get scaleY() {
    return this._scaleY;
  }
  set scaleY(value: number) {
    const oldSY = this._scaleY;
    this._scaleY = value;
    this.scale(1, this._scaleY / oldSY);
  }

  get width() {
    return this.aabb.width;
  }
  set width(value: number) {
    this.scale(value / this.aabb.width, 1);
  }

  get height() {
    return this.aabb.height;
  }
  set height(value: number) {
    this.scale(1, value / this.aabb.height);
  }

  get angle() {
    return this._angle;
  }
  set angle(value: number) {
    const oldA = this._angle;
    this._angle = value;
    this.rotate(this._angle - oldA);
  }

  constructor(init: GroupInit) {
    this.children = init.children ?? [];

    this._scaleX = init.scaleX ?? 1;
    this._scaleY = init.scaleY ?? 1;
    this._angle = init.angle ?? 0;

    this.aabb = new BoundingBox();
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

  translate(tx: number, ty: number): void {
    for (const child of this.children) {
      child.translate(tx, ty);
    }
  }

  scale(sx: number, sy: number, from = this.aabb.center): void {
    for (const child of this.children) {
      child.scale(sx, sy, from);
    }
  }

  rotate(angle: number, from = this.aabb.center): void {
    for (const child of this.children) {
      child.rotate(angle, from);
    }
  }

  update(): void {
    this.aabb.min.put(Infinity);
    this.aabb.max.put(-Infinity);

    for (const child of this.children) {
      child.update();
      this.aabb.merge(child.aabb);
    }
  }
}
