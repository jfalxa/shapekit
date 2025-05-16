import { remove } from "../utils/array";
import { Renderable, RenderableInit } from "./renderable";

export interface GroupStyle {
  globalCompositeOperation?: GlobalCompositeOperation;
}

export interface GroupInit extends RenderableInit, GroupStyle {
  children?: Renderable[];
}

export class Group extends Renderable {
  children: Renderable[];
  globalCompositeOperation?: GlobalCompositeOperation;

  constructor(init: GroupInit = {}) {
    super(init);
    this.children = [];
    this.globalCompositeOperation = init.globalCompositeOperation;
    if (init.children) this.add.apply(this, init.children);
  }

  add(...children: Renderable[]) {
    this.children.push(...children);
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  insert(index: number, ...children: Renderable[]) {
    this.children.splice(index, 0, ...children);
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  remove(...children: Renderable[]) {
    remove(this.children, children);
    for (let i = 0; i < children.length; i++) {
      children[i].parent = undefined;
    }
  }

  walk(operation: (renderable: Renderable) => void) {
    const stack: Renderable[] = [this];
    while (stack.length > 0) {
      const r = stack.pop()!;
      operation(r);
      if (r instanceof Group) stack.push(...r.children);
    }
  }

  update() {
    super.update();
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update();
    }
  }
}
