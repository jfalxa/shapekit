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

  constructor(init: GroupInit) {
    super(init);
    this.children = init.children ?? [];
    this.invertTransform = new Matrix3();

    this.update();
  }

  getChildAt(x: number, y: number) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      if (child.contains({ x, y })) return child;
    }
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
      const childTransform = new Matrix3();

      if (width !== baseWidth || height !== baseHeight) {
        const sx = width / baseWidth;
        const sy = height / baseHeight;

        for (const child of this.children) {
          childTransform.setTransform(child).scale(sx, sy).decompose(child);
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

    const childOBB = new BoundingBox();

    for (const child of this.children) {
      child.parent = this;
      child.update(rebuild);

      childOBB.copy(child.obb).transform(this.invertTransform);
      this.obb.merge(childOBB);
    }

    this.width = this.baseWidth = this.obb.width;
    this.height = this.baseHeight = this.obb.height;

    this.obb.transform(this.transform);
  }
}

const gradient = {
  from: [0, 0],
  to: [200, 0],
  stops: {
    0: "red",
    14: "green",
    65: "blue",
    100: "purple",
  },
};

const lgr = linearGradient(0, 0, 200, 0, {
  0: "red",
  14: "green",
  65: "blue",
  100: "purple",
});

const cgr = conicGradient(0, 0, Math.PI / 4, {
  0: "red",
  14: "green",
  65: "blue",
  100: "purple",
});

const rgr = radialGradient(0, 0, 5, 200, 0, 10, {
  0: "red",
  14: "green",
  65: "blue",
  100: "purple",
});
