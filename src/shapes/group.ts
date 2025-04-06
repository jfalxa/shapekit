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

  private _x: number = 0;
  private _y: number = 0;
  private _scaleX: number = 1;
  private _scaleY: number = 1;
  private _angle: number = 0;
  private _width: number = 0;
  private _height: number = 0;

  aabb: BoundingBox;

  get x() {
    return this._x;
  }
  set x(value: number) {
    const tx = value - this._x;
    this._x = value;
    this.translate(tx, 0);
  }

  get y() {
    return this._y;
  }
  set y(value: number) {
    const ty = value - this._y;
    this._y = value;
    this.translate(0, ty);
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
    return this._width;
  }
  set width(value: number) {
    this._width = value;
  }

  get height() {
    return this._height;
  }
  set height(value: number) {
    this._height = value;
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

    this.aabb = new BoundingBox();
    this.updateAABB();

    if (init.scaleX) this.scaleX = init.scaleX;
    if (init.scaleY) this.scaleY = init.scaleY;
    if (init.angle) this.angle = init.angle;
    if (init.x) this.x = init.x;
    if (init.y) this.y = init.y;

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
    for (const child of this.children) child.update();
    this.updateAABB();
  }

  private updateAABB() {
    this.aabb.min.put(Infinity);
    this.aabb.max.put(-Infinity);

    for (const child of this.children) {
      this.aabb.merge(child.aabb);
    }
  }
}
