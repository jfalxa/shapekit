import { Shape, ShapeInit } from "./shape";

export interface ImageInit extends ShapeInit {
  image: CanvasImageSource;
}

export class Image extends Shape {
  image: CanvasImageSource;

  constructor(init: ImageInit) {
    if (init.width === undefined && init.height === undefined) {
      [init.width, init.height] = Image.dimensions(init.image);
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

  static dimensions(source: CanvasImageSource): [number, number] {
    if (source instanceof HTMLVideoElement) {
      return [source.videoWidth, source.videoHeight];
    } else if (source instanceof VideoFrame) {
      return [source.displayWidth, source.displayHeight];
    } else if (source instanceof SVGImageElement) {
      return [source.width.baseVal.value, source.height.baseVal.value];
    } else {
      return [source.width, source.height];
    }
  }
}
