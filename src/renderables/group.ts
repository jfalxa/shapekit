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
    this.__isContentDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  insert(index: number, ...children: Renderable[]) {
    this.children.splice(index, 0, ...children);
    this.__isContentDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = this;
    }
  }

  remove(...children: Renderable[]) {
    remove(this.children, children);
    this.__isContentDirty = true;
    for (let i = 0; i < children.length; i++) {
      children[i].parent = undefined;
    }
  }

  walk(operation: (renderable: Renderable) => void) {
    operation(this);
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof Group) child.walk(operation);
      else operation(child);
    }
  }

  update(): void {
    super.update();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.__isTransformDirty ||= this.__isTransformDirty;
      child.update();
      this.__isContentDirty ||= child.__isTransformDirty || child.__isContentDirty // prettier-ignore
    }
  }
}
