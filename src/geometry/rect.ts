import { Polygon } from "./polygon";
import { ShapeInit } from "./shape";

export interface RectInit extends ShapeInit {
  width: number;
  height: number;
}

export class Rect extends Polygon {
  width: number;
  height: number;

  constructor(init: RectInit) {
    const halfW = init.width / 2;
    const halfH = init.height / 2;

    const shape = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH },
    ];

    super({ ...init, shape });

    this.width = init.width;
    this.height = init.height;
  }

  update() {
    const halfW = this.width / 2;
    const halfH = this.height / 2;

    this.shape[0].set(-halfW, -halfH);
    this.shape[1].set(halfW, -halfH);
    this.shape[2].set(halfW, halfH);
    this.shape[3].set(-halfW, halfH);

    super.update();
  }
}
