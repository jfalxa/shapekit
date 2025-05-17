import { Dirty, trackDirty } from "../utils/dirty";
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

export abstract class Renderable<C = any> implements Dirty {
  id?: string;
  parent?: Group;

  __dirty = false;
  __cache = {} as C;

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
