import { Matrix3 } from "../math/mat3";
import { Point } from "../math/vec2";
import { remove } from "../utils/array";
import { BoundingBox } from "../utils/bounding-box";
import { Clip } from "./clip";
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

    this.naturalWidth = this.obb.width;
    this.naturalHeight = this.obb.height;
  }

  add(...children: Renderable[]) {
    Array.prototype.push.apply(this.children, children);
  }

  insert(index: number, ...children: Renderable[]) {
    this.children.splice(index, 0, ...children);
  }

  remove(...children: Renderable[]) {
    remove(this.children, children);
  }

  at(index: number) {
    return this.children[index];
  }

  getChildAt(point: Point) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      if (child.contains(point)) return child;
    }
  }

  contains(shape: Point | Shape): boolean {
    if (!this.obb.contains(shape)) return false;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof Clip && !child.contains(shape)) return false;
      else if (child.contains(shape)) return true;
    }
    return false;
  }

  overlaps(shape: Shape): boolean {
    if (!this.obb.overlaps(shape)) return false;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof Clip && !child.overlaps(shape)) return false;
      else if (child.overlaps(shape)) return true;
    }
    return false;
  }

  build() {
    const sx = this.naturalWidth !== 0 ? this.width / this.naturalWidth : 1;
    const sy = this.naturalHeight !== 0 ? this.height / this.naturalHeight : 1;

    console.log("group", { sx, sy });

    if (sx !== 1 || sy !== 1) {
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];

        child.width = child.naturalWidth;
        child.height = child.naturalHeight;

        this.#transform
          .identity()
          .compose(child)
          .scale(sx, sy)
          .decompose(child, true);
      }
    }
  }

  update(rebuild?: boolean, updateParent = true, updateChildren = true): void {
    super.update(rebuild);

    this.#transform.copy(this.transform).invert();

    const hasChildren = this.children.length > 0;
    this.obb.min.put(hasChildren ? +Infinity : 0);
    this.obb.max.put(hasChildren ? -Infinity : 0);
    if (!hasChildren) this.obb.update();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.parent = this;

      if (updateChildren) child.update(rebuild, false, true);

      this.#obb.copy(child.obb).transform(this.#transform);
      this.obb.merge(this.#obb);
    }

    this.width = this.obb.width;
    this.height = this.obb.height;

    this.obb.transform(this.transform);

    if (updateParent) {
      this.parent?.update(false, true, false);
    }
  }
}
