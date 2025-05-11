import { Matrix3 } from "../math/mat3";
import { v, Vec2 } from "../math/vec2";
import { BoundingBox } from "./bounding-box";
import { Renderable, Transform } from "../renderables/renderable";
import { epsilon } from "../math/num";

interface Snapshot extends Transform {
  transform: Matrix3;
  invParentTransform: Matrix3;
}

export class Transformer {
  x!: number;
  y!: number;
  width!: number;
  height!: number;
  scaleX!: number;
  scaleY!: number;
  skewX!: number;
  skewY!: number;
  rotation!: number;

  obb = new BoundingBox();

  #x!: number;
  #y!: number;
  #width!: number;
  #height!: number;
  #scaleX!: number;
  #scaleY!: number;
  #skewX!: number;
  #skewY!: number;
  #rotation!: number;

  #snapshots = new Map<Renderable, Snapshot>();
  #snapshot!: Snapshot;
  #center = new Vec2(0, 0);
  #delta = new Vec2(0, 0);
  #obb = new BoundingBox();
  #transform = new Matrix3();
  #selectionTransform = new Matrix3();

  constructor(public selection: Renderable[]) {
    this.reset();
  }

  translate(deltaX: number, deltaY: number) {
    this.x = this.#x + deltaX;
    this.y = this.#y + deltaY;
  }

  resize(deltaX: number, deltaY: number, handleX: number, handleY: number) {
    const delta = new Vec2(deltaX, deltaY);
    const start = new Vec2(handleX, handleY);
    const end = v(start).add(delta);
    const anchor = v(this.#center).scale(2).subtract(start);

    const { rotation, skewX, skewY } =
      this.selection.length === 1 ? this.selection[0] : this;

    this.#transform
      .identity()
      .skew(skewX, skewY)
      .rotate(rotation)
      .translate(this.#center.x, this.#center.y)
      .invert();

    const startLocal = v(start).transform(this.#transform);
    const endLocal = v(end).transform(this.#transform);
    const anchorLocal = v(anchor).transform(this.#transform);

    const startDims = v(startLocal).subtract(anchorLocal);
    const endDims = v(endLocal).subtract(anchorLocal);

    const signX = Math.sign(startDims.x * endDims.x);
    const signY = Math.sign(startDims.y * endDims.y);

    const sx = (Math.abs(endDims.x) * signX) / this.#width;
    const sy = (Math.abs(endDims.y) * signY) / this.#height;

    const center =
      this.selection.length === 1 //
        ? this.selection[0].center
        : this.#center;

    const [dx, dy] = this.#delta
      .put(0)
      .add(center)
      .subtract(anchor)
      .scale(sx / this.#scaleX, sy / this.#scaleY)
      .skew(this.skewX - this.#skewX, this.skewY - this.#skewY)
      .rotate(this.rotation - this.#rotation)
      .add(anchor)
      .subtract(center);

    if (!epsilon(startLocal.x)) {
      this.x = this.#x + dx;
      this.width = Math.abs(endDims.x);
      this.scaleX = Math.sign(startDims.x * endDims.x);
    }

    if (!epsilon(startLocal.y)) {
      this.y = this.#y + dy;
      this.height = Math.abs(endDims.y);
      this.scaleY = Math.sign(startDims.y * endDims.y);
    }

    this.apply();
  }

  reset() {
    this.#obb.min.put(+Infinity);
    this.#obb.max.put(-Infinity);

    this.#snapshots.clear();

    for (const renderable of this.selection) {
      this.#snapshot = this.snapshot(renderable);
      if (this.selection.length > 1) this.#obb.merge(renderable.obb);
    }

    if (this.selection.length === 1) {
      this.#obb.copy(this.selection[0].obb);
    }

    this.obb.copy(this.#obb);
    this.#center.copy(this.obb.center);

    this.x = this.#x = 0;
    this.y = this.#y = 0;
    this.width = this.#width = this.obb.width;
    this.height = this.#height = this.obb.height;
    this.scaleX = this.#scaleX = 1;
    this.scaleY = this.#scaleY = 1;
    this.skewX = this.#skewX = 0;
    this.skewY = this.#skewY = 0;
    this.rotation = this.#rotation = 0;
  }

  commit() {
    this.#x = this.x;
    this.#y = this.y;
    this.#width = this.width;
    this.#height = this.height;
    this.#scaleX = this.scaleX;
    this.#scaleY = this.scaleY;
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
    const localTransform = new Matrix3().compose(renderable);
    const parentTransform = new Matrix3(renderable.parent?.transform);
    const invParentTransform = new Matrix3(parentTransform).invert();
    const transform = new Matrix3(localTransform).transform(parentTransform);

    const decomposed = transform.decompose();
    decomposed.width = renderable.width;
    decomposed.height = renderable.height;

    const snapshot = { ...decomposed, transform, invParentTransform };
    this.#snapshots.set(renderable, snapshot);
    return snapshot;
  }

  apply() {
    const [cx, cy] = this.#obb.center;

    const sx = this.scaleX * (this.width / this.#obb.width);
    const sy = this.scaleY * (this.height / this.#obb.height);

    let rotation = this.#rotation;

    if (this.selection.length === 1) {
      rotation += this.#snapshot!.rotation;
    }

    if (this.selection.length === 1) {
      const [renderable] = this.selection;

      const transform = {
        x: this.#snapshot.x + this.x,
        y: this.#snapshot.y + this.y,
        scaleX: this.#snapshot.scaleY * sx,
        scaleY: this.#snapshot.scaleX * sy,
        skewX: this.#snapshot.skewX + this.skewX,
        skewY: this.#snapshot.skewY + this.skewY,
        rotation: this.#snapshot.rotation + this.rotation,
      };

      renderable.width = this.#snapshot.width;
      renderable.height = this.#snapshot.height;

      this.#transform
        .identity()
        .compose(transform)
        .transform(this.#snapshot!.invParentTransform)
        .decompose(renderable, true);

      renderable.update();
      this.obb.copy(renderable.obb);

      return;
    }

    this.#transform
      .identity()
      .translate(-cx, -cy)
      .scale(sx, sy)
      .compose(this)
      .translate(+cx, +cy);

    for (const renderable of this.selection) {
      const snapshot = this.#snapshots.get(renderable)!;

      renderable.width = snapshot.width;
      renderable.height = snapshot.height;

      this.#selectionTransform
        .copy(snapshot.transform)
        .transform(this.#transform)
        .transform(snapshot.invParentTransform)
        .decompose(renderable, true);

      renderable.update();
    }

    this.obb.copy(this.#obb).transform(this.#transform);
  }
}
