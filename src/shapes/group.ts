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
  invertTransform: Matrix3;

  private static matrix = new Matrix3();
  private static obb = new BoundingBox();

  constructor(init: GroupInit) {
    super(init);
    this.children = init.children ?? [];
    this.invertTransform = new Matrix3();

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

  build() {
    const { width, height, baseWidth, baseHeight } = this;

    if (width && height && baseWidth && baseHeight) {
      if (width !== baseWidth || height !== baseHeight) {
        const sx = width / baseWidth;
        const sy = height / baseHeight;

        for (const child of this.children) {
          Group.matrix.setTransform(child).scale(sx, sy).decompose(child);
        }
      }
    }
  }

  update(rebuild = false): void {
    super.update(rebuild);

    this.invertTransform.set(this.transform);
    this.invertTransform.invert();

    this.obb.min.put(Infinity);
    this.obb.max.put(-Infinity);

    for (const child of this.children) {
      child.parent = this;
      child.update(rebuild);

      Group.obb.copy(child.obb).transform(this.invertTransform);
      this.obb.merge(Group.obb);
    }

    this.baseWidth = this.obb.width;
    this.baseHeight = this.obb.height;
    this.width = this.obb.width;
    this.height = this.obb.height;

    this.obb.transform(this.transform);
  }
}
