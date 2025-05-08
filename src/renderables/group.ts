import { Matrix3 } from "../math/mat3";
import { Point } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Renderable, RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface GroupStyle {
  globalCompositeOperation?: GlobalCompositeOperation;
}

export interface GroupInit extends RenderableInit, GroupStyle {
  children?: Renderable[];
}

export class Group extends Renderable {
  children: Renderable[];
  globalCompositeOperation?: GlobalCompositeOperation;

  #transform = new Matrix3();
  #obb = new BoundingBox();

  constructor(init: GroupInit) {
    super(init);

    this.children = init.children ?? [];
    this.globalCompositeOperation = init.globalCompositeOperation;

    this.update(false, false, true);
  }

  getChildAt(x: number, y: number) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      if (child.contains({ x, y })) return child;
    }
  }

  contains(shape: Point | Shape): boolean {
    if (!this.obb.contains(shape)) return false;
    for (const child of this.children) {
      if (child.contains(shape)) return true;
    }
    return false;
  }

  overlaps(shape: Shape): boolean {
    if (!this.obb.overlaps(shape)) return false;
    for (const child of this.children) {
      if (child.overlaps(shape)) return true;
    }
    return false;
  }

  build() {
    const sx = this.baseWidth !== 0 ? this.width / this.baseWidth : 1;
    const sy = this.baseHeight !== 0 ? this.height / this.baseHeight : 1;

    if (sx !== 1 || sy !== 1) {
      for (const child of this.children) {
        this.#transform
          .identity()
          .compose(child)
          .scale(sx, sy)
          .decompose(child);
      }
    }
  }

  update(rebuild?: boolean, updateParent = true, updateChildren = true): void {
    super.update(rebuild);

    this.#transform.copy(this.transform).invert();

    this.obb.min.put(Infinity);
    this.obb.max.put(-Infinity);

    for (const child of this.children) {
      child.parent = this;
      if (updateChildren) child.update(rebuild, false, true);

      this.#obb.copy(child.obb).transform(this.#transform);
      this.obb.merge(this.#obb);
    }

    this.width = this.baseWidth = this.obb.width;
    this.height = this.baseHeight = this.obb.height;

    this.obb.transform(this.transform);

    if (updateParent) {
      this.parent?.update(false, true, false);
    }
  }
}
