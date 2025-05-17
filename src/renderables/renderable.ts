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
}

export abstract class Renderable {
  id?: string;
  parent?: Group;

  __cache: Record<string, any> = {};

  declare x: number;
  declare y: number;
  declare scaleX: number;
  declare scaleY: number;
  declare skewX: number;
  declare skewY: number;
  declare rotation: number;

  constructor(init: RenderableInit = {}) {
    this.id = init.id;

    this.x = init.x ?? 0;
    this.y = init.y ?? 0;
    this.scaleX = init.scaleX ?? 1;
    this.scaleY = init.scaleY ?? 1;
    this.skewX = init.skewX ?? 0;
    this.skewY = init.skewY ?? 0;
    this.rotation = init.rotation ?? 0;
  }
}

function markTransformDirty(renderable: Renderable) {
  renderable.__cache.dirtyTransform = true;
  if (renderable instanceof Group) {
    renderable.walk((r) => (r.__cache.dirtyTransform = true));
  }
}

track(
  Renderable.prototype,
  ["x", "y", "width", "height", "scaleX", "scaleY", "skewX", "skewY", "rotation"], // prettier-ignore
  markTransformDirty
);
