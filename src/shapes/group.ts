import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { Renderable, RenderableInit } from "./renderable";
import { Shape } from "./shape";

export interface GroupInit extends RenderableInit {
  children?: Renderable[];
}

export class Group extends Renderable {
  children: Renderable[];
  localTransformation: Matrix3;

  constructor(init: GroupInit) {
    super(init);
    this.children = init.children ?? [];
    this.localTransformation = new Matrix3();
    this.update();
  }

  contains(shape: Vec2 | Shape): boolean {
    for (const child of this.children) {
      if (child.contains(shape)) return true;
    }
    return false;
  }

  overlaps(shape: Shape): boolean {
    for (const child of this.children) {
      if (child.overlaps(shape)) return true;
    }
    return false;
  }

  build(): void {
    for (const child of this.children) {
      child.parent = this;
      child.build();
    }
  }

  update(): void {
    this.localTransformation.setTransform(this);
    this.transformation.set(this.localTransformation);
    if (this.parent) this.transformation.transform(this.parent.transformation);

    this.aabb.min.put(Infinity);
    this.aabb.max.put(-Infinity);

    for (const child of this.children) {
      child.parent = this;
      child.update();
      this.aabb.merge(child.localOBB);
    }

    this.width = this.aabb.width;
    this.height = this.aabb.height;

    this.localOBB.copy(this.aabb).transform(this.localTransformation);
    this.obb.copy(this.aabb).transform(this.transformation);
  }
}
