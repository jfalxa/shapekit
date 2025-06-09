import { markDirty } from "../utils/cache";
import { track } from "../utils/track";
import { Renderable, RenderableInit } from "./renderable";

export interface ImageInit extends RenderableInit {
  image: CanvasImageSource;
  width?: number;
  height?: number;
}

export class Image extends Renderable {
  image: CanvasImageSource;

  width?: number;
  height?: number;

  naturalWidth: number;
  naturalHeight: number;

  constructor(init: ImageInit) {
    super(init);

    this.image = init.image;

    [this.naturalWidth, this.naturalHeight] = Image.dimensions(init.image);

    this.width = init.width;
    this.height = init.height;
  }

  getWidth() {
    if (this.width !== undefined) return this.width;
    else if (this.height !== undefined) return this.height * (this.naturalWidth / this.naturalHeight); // prettier-ignore
    else return this.naturalWidth;
  }

  getHeight() {
    if (this.height !== undefined) return this.height;
    else if (this.width !== undefined) return this.width * (this.naturalHeight / this.naturalWidth); // prettier-ignore
    else return this.naturalHeight;
  }

  update() {
    super.update();

    if (this.__isDirty) {
      [this.naturalWidth, this.naturalHeight] = Image.dimensions(this.image);
    }
  }

  static load(src: string): Promise<HTMLImageElement> {
    const image = new window.Image();
    image.src = src;

    return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
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

track(Image, ['image'], markDirty)