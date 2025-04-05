import { Path } from "../utils/path";
import { Shape, ShapeInit } from "./shape";

export interface ImageInit extends Omit<ShapeInit, "path"> {
  path?: Path;
  width?: number;
  height?: number;
  src: string;
}

export class Image extends Shape {
  image: HTMLImageElement;

  width: number;
  height: number;

  constructor(imageInit: ImageInit) {
    let path = imageInit.path;

    if (path === undefined) {
      path = new Path();
      if (imageInit.width && imageInit.height) {
        path.rect(0, 0, imageInit.width, imageInit.height);
      }
    }

    super({ ...imageInit, path });

    this.width = imageInit.width ?? this.bb.width;
    this.height = imageInit.height ?? this.bb.height;

    this.image = new window.Image(this.width, this.height);
    this.image.src = imageInit.src;

    this.image.onload = () => {
      if (this.path.segments.length === 0) {
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        this.image.width = this.width;
        this.image.height = this.height;
        this.path.rect(0, 0, this.width, this.height);
      }
    };
  }
}
