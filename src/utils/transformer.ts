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
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  skewX!: number;
  skewY!: number;
  rotation!: number;

  obb = new BoundingBox();

  #x!: number;
  #y!: number;
  #width!: number;
  #height!: number;
  #skewX!: number;
  #skewY!: number;
  #rotation!: number;

  #snapshots = new Map<Renderable, Snapshot>();
  #center = new Vec2(0, 0);
  #delta = new Vec2(0, 0);
  #obb = new BoundingBox();
  #transform = new Matrix3();
  #selectionTransform = new Matrix3();

  constructor(public selection: Renderable[]) {
    this.reset();
  }

  reset() {
    this.#obb.min.put(+Infinity);
    this.#obb.max.put(-Infinity);

    for (const renderable of this.selection) {
      this.snapshot(renderable);
      this.#obb.merge(renderable.obb);
    }

    this.obb.copy(this.#obb);
    this.#center.copy(this.obb.center);

    this.x = this.#x = 0;
    this.y = this.#y = 0;
    this.width = this.#width = this.obb.width;
    this.height = this.#height = this.obb.height;
    this.skewX = this.#skewX = 0;
    this.skewY = this.#skewY = 0;
    this.rotation = this.#rotation = 0;
  }

  commit(anchor?: Vec2) {
    this.apply(anchor);
    this.x += this.#delta.x;
    this.y += this.#delta.y;
    this.#x = this.x;
    this.#y = this.y;
    this.#width = this.width;
    this.#height = this.height;
    this.#skewX = this.skewX;
    this.#skewY = this.skewY;
    this.#rotation = this.rotation;
    this.#center.copy(this.obb.center);
  }

  revert() {
    this.x = this.#x;
    this.y = this.#y;
    this.width = this.#width;
    this.height = this.#height;
    this.rotation = this.#rotation;
    this.skewX = this.#skewX;
    this.skewY = this.#skewY;
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

  apply(anchor = this.obb.center) {
    const [cx, cy] = this.#obb.center;

    const sx = this.width / this.#obb.width;
    const sy = this.height / this.#obb.height;

    // compute delta necessary to apply non-committed transforms around anchor
    const [dx, dy] = this.#delta
      .copy(this.#center)
      .subtract(anchor)
      .rotate(-this.rotation)
      .scale(sx, sy)
      .skew(this.skewX - this.#skewX, this.skewY - this.#skewY)
      .rotate(this.rotation - this.#rotation)
      .rotate(this.rotation)
      .add(anchor)
      .subtract(this.#center);

    this.#transform
      .identity()
      .translate(-cx, -cy)
      .scale(sx, sy)
      .compose(this)
      .translate(dx, dy)
      .translate(+cx, +cy);

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

    this.obb.copy(this.#obb).transform(this.#transform);
  }
}
