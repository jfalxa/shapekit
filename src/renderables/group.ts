import { AABB } from "../bbox/aabb";
import { OBB } from "../bbox/obb";
import { Matrix3 } from "../math/mat3";
import { GroupInit, LightGroup } from "./light-group";
import { Shape } from "./shape";

export class Group extends LightGroup {
  width!: number;
  height!: number;

  obb: OBB;

  __localTransform: Matrix3;
  __naturalAABB: AABB;
  __naturalOBB: OBB;
  __localAABB: AABB;
  __localOBB: OBB;

  isSizeDirty: boolean;

  constructor(init: GroupInit) {
    super(init);

    this.obb = new OBB();

    this.__localTransform = new Matrix3();

    this.__naturalAABB = new AABB();
    this.__naturalOBB = new OBB();

    this.__localAABB = new AABB();
    this.__localOBB = new OBB();

    this.isSizeDirty = true;
  }

  update() {
    if (this.isTransformDirty) {
      this.__localTransform.identity().compose(this);
    }

    if (
      this.parent &&
      (this.isTransformDirty || this.parent.isTransformDirty)
    ) {
      this.isTransformDirty = true;
      this.transform
        .copy(this.__localTransform)
        .transform(this.parent.transform);
    }

    this.__naturalAABB.reset();
    this.__localAABB.reset();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.update();

      if (child instanceof Group || child instanceof Shape) {
        this.__naturalAABB.mergeAABB(child.__naturalOBB);
        this.__localAABB.mergeAABB(child.__localOBB);
      }
    }

    this.__naturalOBB.copy(this.__naturalAABB).transform(this.__localTransform);
    this.__localOBB.copy(this.__localAABB).transform(this.__localTransform);

    if (this.width === undefined || this.height === undefined) {
      this.width = this.__localAABB.width;
      this.height = this.__localAABB.height;
    }

    this.obb.copy(this.__localAABB).transform(this.transform);
  }

  clean() {
    this.isTransformDirty = false;
    this.isSizeDirty = false;
  }
}
