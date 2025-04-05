import { Shape, ShapeInit } from "./shape";

export interface ImageInit extends ShapeInit {
  src: string;
}

export class Image extends Shape {
  image: HTMLImageElement;

  constructor(imageInit: ImageInit) {
    super(imageInit);

    this.width = imageInit.width ?? this.bb.width;
    this.height = imageInit.height ?? this.bb.height;

    this.image = new window.Image(this.width, this.height);
    this.image.src = imageInit.src;

    this.image.onload = () => {
      if (!this.width && !this.height) {
        this.width = this.image.naturalWidth;
        this.height = this.image.naturalHeight;
        this.image.width = this.width;
        this.image.height = this.height;
        this.path.rect(0, 0, this.width, this.height);
        this.build();
      }
    };
  }
}
