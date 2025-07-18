import { Group } from "./group";

export type Render = (ctx: CanvasRenderingContext2D) => void;

export class Raw {
  parent?: Group;
  render: Render;

  constructor(render: Render) {
    this.render = render;
  }
}
