import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Renderable, RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface GroupInit extends RenderableInit {
  children?: Renderable[];
}

export class Group extends Renderable {
  children: Renderable[];

  private _childTransformation: Matrix3;
  private _childOBB: BoundingBox;

  constructor(init: GroupInit) {
    super(init);
    this.children = init.children ?? [];
    this._childTransformation = new Matrix3();
    this._childOBB = new BoundingBox();

    this.update(true);
  }

  contains(shape: Vec2 | Shape): boolean {
    if (!this.obb.mayContain(shape)) return false;
    for (const child of this.children) {
      if (child.contains(shape)) return true;
    }
    return false;
  }

  overlaps(shape: Shape): boolean {
    if (!this.obb.mayOverlap(shape)) return false;
    for (const child of this.children) {
      if (child.overlaps(shape)) return true;
    }
    return false;
  }

  update(rebuild = false): void {
    if (rebuild) {
      const { width, height, _obb: box } = this;

      if (width && height && box.width && box.height) {
        if (width !== box.width || height !== box.height) {
          const sx = width / box.width;
          const sy = height / box.height;

          for (const child of this.children) {
            this._childTransformation
              .setTransform(child)
              .scale(sx, sy)
              .decompose(child);
          }
        }
      }
    }

    this.transformation.setTransform(this);
    if (this.parent) this.transformation.transform(this.parent.transformation);

    this._obb.min.put(Infinity);
    this._obb.max.put(-Infinity);

    for (const child of this.children) {
      child.parent = this;
      child.update(rebuild);

      this._childTransformation.setTransform(child);
      this._childOBB.copy(child._obb).transform(this._childTransformation);

      this._obb.merge(this._childOBB);
    }

    this.width = this._obb.width;
    this.height = this._obb.height;

    this.obb.copy(this._obb).transform(this.transformation);
  }
}
