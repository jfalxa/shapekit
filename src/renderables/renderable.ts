import { Matrix3 } from "../math/mat3";
import { Point, Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Group } from "./group";
import { Shape } from "./shape";

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

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotation: number;

  naturalWidth: number;
  naturalHeight: number;

  transform: Matrix3;
  obb: BoundingBox;
  center: Vec2;

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
    this.rotation = init.rotation ?? 0;

    this.naturalWidth = init.width ?? 0;
    this.naturalHeight = init.height ?? 0;

    this.transform = new Matrix3();
    this.obb = new BoundingBox();
    this.center = new Vec2();
  }

  abstract contains(shape: Point | Shape): boolean;
  abstract overlaps(shape: Shape): boolean;
  abstract build(): void;

  update(rebuild = false, _updateParent?: boolean, _updateChildren?: boolean) {
    if (rebuild) this.build();
    this.transform.identity().compose(this);
    if (this.parent) this.transform.transform(this.parent.transform);
    this.center.put(0).transform(this.transform);
  }
}
