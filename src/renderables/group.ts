import { remove } from "../utils/array";
import { markDirty } from "../utils/cache";
import { Raw } from "./raw";
import { Renderable, RenderableInit } from "./renderable";

export type Child = Renderable | Raw;

export interface GroupStyle {
  globalCompositeOperation?: GlobalCompositeOperation;
}

export interface GroupInit extends RenderableInit, GroupStyle {
  children?: Renderable[];
}

export class Group extends Renderable {
  children: Child[];
  globalCompositeOperation?: GlobalCompositeOperation;

  constructor(init: GroupInit = {}) {
    super(init);
    this.children = init.children ?? [];
    this.globalCompositeOperation = init.globalCompositeOperation;
    bindParent(this.children, this);
  }

  add(...children: Child[]) {
    this.children.push(...children);
    bindParent(children, this);
    markDirty(this);
  }

  insert(index: number, ...children: Child[]) {
    this.children.splice(index, 0, ...children);
    bindParent(children, this);
    markDirty(this);
  }

  remove(...children: Child[]) {
    remove(this.children, children);
    bindParent(children, undefined);
    markDirty(this);
  }

  update(): void {
    super.update();

    const isGroupDirty = this.__isDirty;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof Renderable) {
        if (isGroupDirty && !child.__isDirty) markDirty(child);
        child.update();
        if (child.__isDirty && !this.__isDirty) markDirty(this);
      }
    }
  }
}

export function walk<T = void>(
  renderable: Child,
  operation: (renderable: Child) => T
): T {
  const result = operation(renderable);
  if (result !== undefined) return result;

  if (renderable instanceof Group) {
    for (let i = 0; i < renderable.children.length; i++) {
      const child = renderable.children[i];
      const result = walk(child, operation);
      if (result !== undefined) return result;
    }
  }

  return undefined as T;
}

function bindParent(children: Child[], parent: Group | undefined) {
  for (let i = 0; i < children.length; i++) {
    children[i].parent = parent;
  }
}
