export type Render = (ctx: CanvasRenderingContext2D) => void;

export class Raw {
  render: Render;

  constructor(render: Render) {
    this.render = render;
  }
}
