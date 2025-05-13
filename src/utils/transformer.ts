import { Matrix3 } from "../math/mat3";
import { Point, v, Vec2 } from "../math/vec2";
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
  #single!: Snapshot;
  #center = new Vec2(0, 0);
  #delta = new Vec2(0, 0);
  #obb = new BoundingBox();
  #transform = new Matrix3();
  #selectionTransform = new Matrix3();

  constructor(public selection: Renderable[]) {
    this.reset();
  }

  apply() {
    if (this.selection.length === 1) {
      this.#applySingle();
    } else {
      this.#applyMultiple();
    }
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
    this.apply();
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

  reset() {
    this.#obb.min.put(+Infinity);
    this.#obb.max.put(-Infinity);

    this.#snapshots.clear();

    for (let i = 0; i < this.selection.length; i++) {
      const renderable = this.selection[i];
      this.#single = this.#snapshot(renderable);
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

  translate(delta: Point) {
    this.x = this.#x + delta.x;
    this.y = this.#y + delta.y;
  }

  rotate(handle: Point, delta: Point) {
    const start = v(handle);
    const end = v(start).translate(delta.x, delta.y);
    const anchor = this.#center;

    const [startLocal, endLocal, anchorLocal] = this.#local(start, end, anchor);

    const AB = v(startLocal).subtract(anchorLocal);
    const AC = v(endLocal).subtract(anchorLocal);

    const startAngle = Math.atan2(AB.y, AB.x);
    const endAngle = Math.atan2(AC.y, AC.x);

    let angle = endAngle - startAngle;
    if (angle > Math.PI) angle -= 2 * Math.PI;
    else if (angle <= -Math.PI) angle += 2 * Math.PI;

    this.rotation = this.#rotation + angle;

    const [dx, dy] = this.#adjust(anchor);
    this.x = this.#x + dx;
    this.y = this.#y + dy;

    this.apply();
  }

  resize(handle: Point, delta: Point) {
    const start = v(handle);
    const end = v(start).translate(delta.x, delta.y);
    const anchor = v(this.#center).scale(2).subtract(start);

    const [startLocal, endLocal, anchorLocal] = this.#local(start, end, anchor);

    const startDims = v(startLocal).subtract(anchorLocal);
    const endDims = v(endLocal).subtract(anchorLocal);

    const signX = Math.sign(startDims.x * endDims.x);
    const signY = Math.sign(startDims.y * endDims.y);

    const sx = (Math.abs(endDims.x) / this.#width) * signX;
    const sy = (Math.abs(endDims.y) / this.#height) * signY;

    const [dx, dy] = this.#adjust(anchor, sx, sy);

    if (!epsilon(startLocal.x)) {
      this.x = this.#x + dx;
      this.width = Math.abs(endDims.x);
      this.scaleX = signX;
    }

    if (!epsilon(startLocal.y)) {
      this.y = this.#y + dy;
      this.height = Math.abs(endDims.y);
      this.scaleY = signY;
    }

    this.apply();
  }

  #applySingle() {
    const [renderable] = this.selection;
    const { width, height } = this.#obb;

    const sx = width !== 0 ? this.scaleX * (this.width / width) : 1;
    const sy = height !== 0 ? this.scaleY * (this.height / height) : 1;

    const transform = {
      x: this.#single.x + this.x,
      y: this.#single.y + this.y,
      scaleX: this.#single.scaleX * sx,
      scaleY: this.#single.scaleY * sy,
      skewX: this.#single.skewX + this.skewX,
      skewY: this.#single.skewY + this.skewY,
      rotation: this.#single.rotation + this.rotation,
    };

    renderable.width = this.#single.width;
    renderable.height = this.#single.height;

    this.#transform
      .identity()
      .compose(transform)
      .transform(this.#single!.invParentTransform)
      .decompose(renderable, true);

    renderable.update();
    this.obb.copy(renderable.obb);
  }

  #applyMultiple() {
    const [cx, cy] = this.#obb.center;
    const sx = this.scaleX * (this.width / this.#obb.width);
    const sy = this.scaleY * (this.height / this.#obb.height);

    this.#transform
      .identity()
      .translate(-cx, -cy)
      .scale(sx, sy)
      .compose(this)
      .translate(+cx, +cy);

    for (let i = 0; i < this.selection.length; i++) {
      const renderable = this.selection[i];
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

  #snapshot(renderable: Renderable) {
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

  #adjust(anchor: Vec2, sx = this.scaleX, sy = this.scaleY) {
    const center =
      this.selection.length === 1 //
        ? this.selection[0].center
        : this.#center;

    return this.#delta
      .put(0)
      .add(center)
      .subtract(anchor)
      .scale(sx / this.#scaleX, sy / this.#scaleY)
      .skew(this.skewX - this.#skewX, this.skewY - this.#skewY)
      .rotate(this.rotation - this.#rotation)
      .add(anchor)
      .subtract(center);
  }

  #local(...vectors: Vec2[]) {
    const locals = new Array<Vec2>(vectors.length);

    const { rotation, skewX, skewY } =
      this.selection.length === 1 //
        ? this.selection[0]
        : this;

    this.#transform
      .identity()
      .skew(skewX, skewY)
      .rotate(rotation)
      .translate(this.#center.x, this.#center.y)
      .invert();

    for (let i = 0; i < vectors.length; i++) {
      locals[i] = v(vectors[i]).transform(this.#transform);
    }

    return locals;
  }
}
