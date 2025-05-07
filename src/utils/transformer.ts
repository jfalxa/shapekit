import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { BoundingBox } from "./bounding-box";
import { Renderable } from "../renderables/renderable";

interface Snapshot {
  width: number;
  height: number;
  transform: Matrix3;
  invParentTransform: Matrix3;
}

export class Transformer {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  skewX = 0;
  skewY = 0;
  rotation = 0;

  obb = new BoundingBox();

  #width = 0;
  #height = 0;

  #center = new Vec2(0, 0);
  #pivot = new Vec2(0, 0);
  #snapshots = new Map<Renderable, Snapshot>();
  #transform = new Matrix3();
  #invTransform = new Matrix3();
  #selectionTransform = new Matrix3();
  #selectionOBB = new BoundingBox();

  constructor(public selection: Renderable[]) {
    this.fit();

    this.width = this.#width = this.obb.width;
    this.height = this.#height = this.obb.height;
    this.#center.copy(this.obb.center);

    for (const renderable of this.selection) {
      this.snapshot(renderable);
    }
  }

  commit(pivot?: Vec2) {
    this.apply(pivot);
    this.x = this.obb.center.x - this.#center.x;
    this.y = this.obb.center.y - this.#center.y;
  }

  revert() {
    this.x = 0;
    this.y = 0;
    this.width = this.#width;
    this.height = this.#height;
    this.rotation = 0;
    this.skewX = 0;
    this.skewY = 0;
    this.apply();
  }

  snapshot(renderable: Renderable) {
    const width = renderable.width != null ? renderable.width : 0;
    const height = renderable.height != null ? renderable.height : 0;

    const localTransform = new Matrix3().compose(renderable);
    const parentTransform = new Matrix3(renderable.parent?.transform);
    const invParentTransform = new Matrix3(parentTransform).invert();
    const transform = new Matrix3(localTransform).transform(parentTransform);

    this.#snapshots.set(renderable, {
      width,
      height,
      transform,
      invParentTransform,
    });
  }

  fit() {
    if (this.selection.length === 1) {
      this.obb.copy(this.selection[0].obb);
      return;
    }

    this.obb.min.put(+Infinity);
    this.obb.max.put(-Infinity);

    for (const renderable of this.selection) {
      this.#selectionOBB.copy(renderable.obb).transform(this.#invTransform);
      this.obb.merge(this.#selectionOBB);
    }

    this.obb.transform(this.#transform);
  }

  apply(pivot = this.obb.center) {
    this.#pivot.copy(pivot).transform(this.#invTransform);

    const sx = this.#width !== 0 ? this.width / this.#width : 1;
    const sy = this.#height !== 0 ? this.height / this.#height : 1;

    this.#transform
      .identity()
      .translate(-this.#pivot.x, -this.#pivot.y)
      .scale(sx, sy)
      .compose(this)
      .translate(+this.#pivot.x, +this.#pivot.y);

    this.#invTransform.copy(this.#transform).invert();

    for (const renderable of this.selection) {
      const snapshot = this.#snapshots.get(renderable)!;

      renderable.width = snapshot.width;
      renderable.height = snapshot.height;

      this.#selectionTransform
        .copy(snapshot.transform)
        .transform(this.#transform)
        .transform(snapshot.invParentTransform)
        .decompose(renderable);

      renderable.update();
    }

    this.fit();
  }
}
