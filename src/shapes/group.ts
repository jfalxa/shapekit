import { Matrix3 } from "../math/mat3";
import { Point } from "../math/vec2";
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

  constructor(init: GroupInit) {
    super(init);

    this.children = init.children ?? [];
    this.globalCompositeOperation = init.globalCompositeOperation;

    this.update();
  }

  getChildAt(x: number, y: number) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      if (child.contains({ x, y })) return child;
    }
  }

  contains(shape: Point | Shape): boolean {
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

  build() {
    const { width, height, baseWidth, baseHeight } = this;

    if (width && height && baseWidth && baseHeight) {
      if (width !== baseWidth || height !== baseHeight) {
        const sx = width / baseWidth;
        const sy = height / baseHeight;

        for (const child of this.children) {
          this.#transform.compose(child).scale(sx, sy).decompose(child);
        }
      }
    }
  }

  update(rebuild = false): void {
    if (rebuild) this.build();

    this.transform.compose(this);
    this.#transform.set(this.transform);
    if (this.parent) this.transform.transform(this.parent.transform);

    this.obb.min.put(Infinity);
    this.obb.max.put(-Infinity);

    for (const child of this.children) {
      child.parent = this;
      child.update(rebuild);
    }

    this.width = this.baseWidth = this.obb.width;
    this.height = this.baseHeight = this.obb.height;

    this.obb.transform(this.#transform);

    if (this.parent) {
      this.parent.obb.merge(this.obb);
      this.obb.transform(this.parent.transform);
    }
  }
}
