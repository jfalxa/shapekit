import { Matrix3, Point } from "../math/mat3";
import { trackDirty } from "../utils/dirty";
import { Group } from "./group";

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotation: number;
}

export interface RenderableInit extends Partial<Transform> {
  id?: string;
}

export abstract class Renderable {
  id?: string;
  parent?: Group;

  dirty = false;

  declare x: number;
  declare y: number;
  declare width: number;
  declare height: number;
  declare scaleX: number;
  declare scaleY: number;
  declare skewX: number;
  declare skewY: number;
  declare rotation: number;

  transform: Matrix3;

  center: Point;

  constructor(init: RenderableInit = {}) {
    this.id = init.id;

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.width = init.width ?? 0;
    this.height = init.height ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.skewX = init.skewX ?? 0;
    this.skewY = init.skewY ?? 0;
    this.rotation = init.rotation ?? 0;

    // this.#x = init.x ?? 0;
    // this.#y = init.y ?? 0;
    // this.#width = init.width ?? 0;
    // this.#height = init.height ?? 0;
    // this.#scaleX = init.scaleX ?? 1;
    // this.#scaleY = init.scaleY ?? 1;
    // this.#skewX = init.skewX ?? 0;
    // this.#skewY = init.skewY ?? 0;
    // this.#rotation = init.rotation ?? 0;

    this.transform = new Matrix3();
    this.center = { x: 0, y: 0 };

    // this.track();
  }

  update() {
    if (this.parent?.dirty) this.dirty = true;
    if (!this.dirty) return;

    this.transform.identity().compose(this);
    if (this.parent) this.transform.transform(this.parent.transform);

    this.center.x = 0;
    this.center.y = 0;
    this.transform.point(this.center);
  }

  // get transform() {
  //   if (this.parent?.dirty) this.dirty = true;
  //   if (this.dirty) {
  //     this.update();
  //     this.dirty = false;
  //   }
  //   return this.#transform;
  // }
}

trackDirty(Renderable.prototype, [
  "x",
  "y",
  "width",
  "height",
  "scaleX",
  "scaleY",
  "skewX",
  "skewY",
  "rotation",
]);
