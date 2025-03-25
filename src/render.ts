import { Loop, Task } from "vroum";
import { Shape } from "./geometry/shape";
import { AABB } from "./utils/aabb";

export class Render extends Task {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  offCanvas: HTMLCanvasElement;
  offCtx: CanvasRenderingContext2D;

  shapes: Shape[] = [];
  dirtyRects: AABB[] = [];

  constructor(canvas: HTMLCanvasElement, loop: Loop) {
    super(loop);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.offCanvas = document.createElement("canvas");
    this.offCanvas.width = canvas.width;
    this.offCanvas.height = canvas.height;
    this.offCtx = this.offCanvas.getContext("2d")!;

    const screenRect = new AABB();
    screenRect.min.set(0);
    screenRect.max.set(canvas.width, canvas.height);
    this.dirtyRects.push(screenRect);
  }

  tick() {
    let s = performance.now();

    this.updateDirtyShapes();
    this.clearDirtyRects();
    this.paintShapes();

    let e = performance.now();
    console.log(e - s, "ms");
  }

  updateDirtyShapes() {
    this.dirtyRects.length = 0;

    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      if (!shape.dirty) continue;

      const aabb = shape.aabb.clone();
      this.dirtyRects.push(aabb);

      shape.update();
      shape.dirty = false;

      if (!shape.aabb.equals(aabb)) {
        this.dirtyRects.push(shape.aabb.clone());
      }
    }
  }

  clearDirtyRects() {
    for (let i = 0; i < this.dirtyRects.length; i++) {
      const dirty = this.dirtyRects[i];
      this.offCtx.clearRect(
        dirty.min.x,
        dirty.min.y,
        dirty.max.x - dirty.min.x,
        dirty.max.y - dirty.min.y
      );
    }
  }

  paintShapes() {
    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];

      for (let j = 0; j < this.dirtyRects.length; j++) {
        const dirty = this.dirtyRects[j];

        if (shape.aabb.overlaps(dirty)) {
          this.ctx.save();
          shape.style(this.ctx);
          shape.transform(this.ctx);
          shape.paint(this.ctx);
          shape.dirty = false;
          this.ctx.restore();
          break;
        }
      }
    }
  }
}
