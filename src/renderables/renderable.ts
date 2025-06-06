import { Matrix3 } from "../utils/mat3";
import { Cache, markDirty } from "../utils/cache";
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

export class Renderable implements Transform, Cache {
  id?: string;
  hidden: boolean;
  parent?: Group;

  declare x: number;
  declare y: number;
  declare scaleX: number;
  declare scaleY: number;
  declare skewX: number;
  declare skewY: number;
  declare rotation: number;

  transform: Matrix3;

  __version: number;
  __cache: Record<string, any>;
  __isDirty: boolean;

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

    this.__version = 0;
    this.__cache = {};
    this.__isDirty = true;
  }

  update() {
    if (this.__isDirty) {
      this.transform.identity().compose(this);
      if (this.parent) this.transform.transform(this.parent.transform);
    }
  }
}

track(
  Renderable,
  ["x", "y", "scaleX", "scaleY", "skewX", "skewY", "rotation"],
  markDirty
);

export function walk<T = void>(
  renderable: Renderable,
  operation: (renderable: Renderable) => T
): T {
  const result = operation(renderable);
  if (result !== undefined) return result;

  if (renderable instanceof Group) {
    for (let i = 0; i < renderable.children.length; i++) {
      const child = renderable.children[i];
      const result = walk(child, operation);
      if (result !== undefined) return result;
    }
  }

  return undefined as T;
}
