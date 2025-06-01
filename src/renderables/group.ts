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

  walk<T = void>(operation: (renderable: Renderable) => T): T {
    const result = operation(this);
    if (result !== undefined) return result;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const result = child instanceof Group ? child.walk(operation) : operation(child); // prettier-ignore
      if (result !== undefined) return result;
    }

    return undefined as T;
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
