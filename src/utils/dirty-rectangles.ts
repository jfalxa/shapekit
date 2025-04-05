import { Shape } from "../shapes/shape";
import { BoundingBox } from "./bounding-box";

export class DirtyRectangles {
  shapes: Shape[] = [];
  dirtyRects: BoundingBox[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const screenRect = new BoundingBox();
    screenRect.min.put(0);
    screenRect.max.put(canvas.width, canvas.height);
    this.dirtyRects.push(screenRect);
  }

  updateDirtyRects() {
    this.dirtyRects.length = 0;

    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      if (!shape.dirty) continue;

      const aabb = shape.aabb.clone();
      this.dirtyRects.push(aabb);

      shape.transform();
      shape.dirty = false;

      if (!shape.aabb.equals(aabb)) {
        this.dirtyRects.push(shape.aabb.clone());
      }
    }

    return this.dirtyRects;
  }

  getDirtyShapes() {
    const dirtyShapes = [];

    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      for (let j = 0; j < this.dirtyRects.length; j++) {
        const dirty = this.dirtyRects[j];
        if (shape.aabb.overlaps(dirty)) {
          dirtyShapes.push(shape);
        }
      }
    }

    return dirtyShapes;
  }
}
