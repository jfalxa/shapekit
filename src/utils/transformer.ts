import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { BoundingBox } from "./bounding-box";
import { Renderable } from "../renderables/renderable";

interface Snapshot {
  renderable: Renderable;
  width: number;
  height: number;
  localTransform: Matrix3;
  parentTransform: Matrix3;
  invParentTransform: Matrix3;
  screenTransform: Matrix3;
}

export class Transformer {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  skewX = 0;
  skewY = 0;
  rotation = 0;

  baseWidth = 0;
  baseHeight = 0;

  transform = new Matrix3();
  invTransform = new Matrix3();

  center = new Vec2(0, 0);
  obb = new BoundingBox();

  snapshots = new Map<Renderable, Snapshot>();

  #transform = new Matrix3();
  #obb = new BoundingBox();

  constructor(public selection: Renderable[]) {
    this.update();
  }

  update() {
    this.x = 0;
    this.y = 0;
    this.skewX = 0;
    this.skewY = 0;
    this.rotation = 0;

    this.snapshots.clear();

    if (this.selection.length === 1) {
      this.snapshot(this.selection[0]);
      this.obb.copy(this.selection[0].obb);
      return;
    }

    this.obb.min.put(+Infinity);
    this.obb.max.put(-Infinity);

    for (const renderable of this.selection) {
      this.snapshot(renderable);
      this.obb.merge(renderable.obb);
    }

    this.center.copy(this.obb.center);
    this.width = this.baseWidth = this.obb.width;
    this.height = this.baseHeight = this.obb.height;
  }

  snapshot(renderable: Renderable) {
    const width = renderable.width != null ? renderable.width : 0;
    const height = renderable.height != null ? renderable.height : 0;

    const localTransform = new Matrix3().compose(renderable);
    const parentTransform = new Matrix3(renderable.parent?.transform);
    const invParentTransform = new Matrix3(parentTransform).invert();
    const screenTransform = new Matrix3(localTransform).transform(parentTransform); // prettier-ignore

    this.snapshots.set(renderable, {
      renderable,
      width,
      height,
      localTransform,
      parentTransform,
      invParentTransform,
      screenTransform,
    });
  }

  apply(from = this.center) {
    const sx = this.baseWidth !== 0 ? this.width / this.baseWidth : 1;
    const sy = this.baseHeight !== 0 ? this.height / this.baseHeight : 1;

    this.transform
      .identity()
      .translate(-from.x, -from.y)
      .scale(sx, sy)
      .compose(this)
      .translate(+from.x, +from.y);

    this.invTransform.copy(this.transform).invert();

    this.obb.min.put(+Infinity);
    this.obb.max.put(-Infinity);

    // apply to each item
    for (const renderable of this.selection) {
      const snapshot = this.snapshots.get(renderable)!;

      renderable.width = snapshot.width;
      renderable.height = snapshot.height;

      this.#transform
        .copy(snapshot.screenTransform)
        .transform(this.transform)
        .transform(snapshot.invParentTransform);

      this.#transform.decompose(renderable);

      renderable.update(false, true, true);

      this.#obb.copy(renderable.obb).transform(this.invTransform);
      this.obb.merge(this.#obb);
    }

    this.width = this.obb.width * sx;
    this.height = this.obb.height * sy;

    this.obb.transform(this.transform);
  }
}
