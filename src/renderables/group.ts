import { remove } from "../utils/array";
import { markDirty } from "../utils/cache";
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
    bindParent(children, this);
    markDirty(this);
  }

  insert(index: number, ...children: Renderable[]) {
    this.children.splice(index, 0, ...children);
    bindParent(children, this);
    markDirty(this);
  }

  remove(...children: Renderable[]) {
    remove(this.children, children);
    bindParent(children, undefined);
    markDirty(this);
  }

  update(): void {
    super.update();

    const isGroupDirty = this.__isDirty;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (isGroupDirty && !child.__isDirty) markDirty(child);
      child.update();
      if (child.__isDirty && !this.__isDirty) markDirty(this);
    }
  }
}

function bindParent(children: Renderable[], parent: Group | undefined) {
  for (let i = 0; i < children.length; i++) {
    children[i].parent = parent;
  }
}
