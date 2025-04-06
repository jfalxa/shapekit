import { rect } from "../path/rect";
import { Shape, ShapeInit } from "./shape";

export interface ImageInit extends ShapeInit {
  image: HTMLImageElement;
}

export class Image extends Shape {
  image: HTMLImageElement;

  constructor(init: ImageInit) {
    super(init);

    this.image = init.image;

    if (this.path.length === 0) {
      this.width = this.image.width;
      this.height = this.image.height;
      this.path = rect(0, 0, this.width, this.height);
      this.build();
    }
  }

  static load(src: string): Promise<HTMLImageElement> {
    const image = new window.Image();
    image.src = src;

    return new Promise((resolve) => {
      image.onload = () => resolve(image);
    });
  }
}
