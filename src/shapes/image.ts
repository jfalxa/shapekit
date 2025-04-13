import { Shape, ShapeInit } from "./shape";

export interface ImageInit extends ShapeInit {
  image: HTMLImageElement;
}

export class Image extends Shape {
  image: HTMLImageElement;

  constructor(init: ImageInit) {
    if (init.width === undefined && init.height === undefined) {
      init.width = init.image.naturalWidth;
      init.height = init.image.naturalHeight;
    }

    super(init);

    this.image = init.image;
  }

  static load(src: string): Promise<HTMLImageElement> {
    const image = new window.Image();
    image.src = src;

    return new Promise((resolve) => {
      image.onload = () => resolve(image);
    });
  }
}
