import { Matrix3 } from "../math/mat3";
import { track } from "../utils/track";
import { Group } from "./group";

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotation: number;
}

export interface RenderableInit extends Partial<Transform> {
  id?: string;
  hidden?: boolean;
}

export class Renderable {
  id?: string;
  parent?: Group;

  declare x: number;
  declare y: number;
  declare scaleX: number;
  declare scaleY: number;
  declare skewX: number;
  declare skewY: number;
  declare rotation: number;

  hidden: boolean;

  transform: Matrix3;

  isTransformDirty: boolean;
  isContentDirty: boolean;

  constructor(init: RenderableInit = {}) {
    this.id = init.id;

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.skewX = init.skewX ?? 0;
    this.skewY = init.skewY ?? 0;
    this.rotation = init.rotation ?? 0;

    this.hidden = init.hidden ?? false;

    this.transform = new Matrix3();

    this.isTransformDirty = true;
    this.isContentDirty = true;
  }

  update() {
    if (this.isTransformDirty) {
      this.transform.identity().compose(this);
    }

    if (this.parent) {
      if (this.isTransformDirty || this.parent.isTransformDirty) {
        this.transform.transform(this.parent.transform);
      }
    }
  }

  clean() {
    this.isTransformDirty = false;
    this.isContentDirty = false;
  }
}

track(
  Renderable,
  ["x", "y", "scaleX", "scaleY", "skewX", "skewY", "rotation"],
  (renderable) => (renderable.isTransformDirty = true)
);
