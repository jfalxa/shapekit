import { AABB } from "../bbox/aabb";
import { OBB } from "../bbox/obb";
import { buildAABB } from "../bbox/path";
import { Matrix3 } from "../math/mat3";
import { PathLike } from "../paths/path";
import { Rect } from "../paths/rect";
import { Segment } from "../paths/segment";
import { track } from "../utils/track";
import { LightShape, LightShapeInit } from "./light-shape";

export interface ShapeInit extends Omit<LightShapeInit, "path"> {
  path?: PathLike;
  width?: number;
  height?: number;
}

export class Shape extends LightShape {
  declare width: number;
  declare height: number;

  aabb: AABB;
  obb: OBB;

  isSizeDirty: boolean;

  constructor(init: ShapeInit) {
    if (!init.path) {
      init.path = [new Rect(0, 0, init.width ?? 0, init.height ?? 0)];
    }

    super(init as LightShapeInit);

    this.aabb = new AABB();
    this.obb = new OBB();

    this.width = init.width!;
    this.height = init.height!;

    this.isSizeDirty = true;
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

    if (this.isContentDirty) {
      buildAABB(this.path, this.aabb);
    }

    if (this.isContentDirty || this.isSizeDirty) {
      const sx = this.width / this.aabb.width;
      const sy = this.height / this.aabb.height;
      this.__path = this.path.scale(sx, sy);
    }

    if (
      this.isTransformDirty ||
      this.parent?.isTransformDirty ||
      this.isContentDirty ||
      this.isSizeDirty
    ) {
      this.obb.copy(this.aabb).transform();
    }
  }

  clean() {
    super.clean();
    this.isSizeDirty = false;
  }
}

track(Shape, ["width", "height"], (shape) => {
  shape.isSizeDirty = true;
});
