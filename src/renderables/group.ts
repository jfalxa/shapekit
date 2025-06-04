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

    if (init.children) {
      this.add(...init.children);
    }
  }

  add(...children: Renderable[]) {
    this.children.push(...children);
    this.__isDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  insert(index: number, ...children: Renderable[]) {
    this.children.splice(index, 0, ...children);
    this.__isDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  remove(...children: Renderable[]) {
    remove(this.children, children);
    this.__isDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = undefined;
    }
  }

  update(): void {
    super.update();

    const isGroupDirty = this.__isDirty;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.__isDirty ||= isGroupDirty;
      child.update();
      this.__isDirty ||= child.__isDirty;
    }
  }
}
