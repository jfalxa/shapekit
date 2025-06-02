// @ts-nocheck

import { Matrix3 } from "../math/mat3";
import { Point, v, Vec2 } from "../math/vec2";
import { BBox } from "../bounds/bbox";
import { Renderable, Transform } from "../renderables/renderable";
import { getBBox } from "../bounds";

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

  obb = new BBox();

  private _x!: number;
  private _y!: number;
  private _width!: number;
  private _height!: number;
  private _scaleX!: number;
  private _scaleY!: number;
  private _skewX!: number;
  private _skewY!: number;
  private _rotation!: number;

  private _snapshots = new Map<Renderable, Snapshot>();
  private _single!: Snapshot;
  private _center = new Vec2();
  private _delta = new Vec2();
  private _obb = new BBox();
  private _transform = new Matrix3();
  private _selectionTransform = new Matrix3();

  constructor(public selection: Renderable[]) {
    this.reset();
  }

  apply() {
    if (this.selection.length === 1) {
      this._applySingle();
    } else {
      this._applyMultiple();
    }
  }

  commit() {
    this._x = this.x;
    this._y = this.y;
    this._width = this.width;
    this._height = this.height;
    this._scaleX = this.scaleX;
    this._scaleY = this.scaleY;
    this._skewX = this.skewX;
    this._skewY = this.skewY;
    this._rotation = this.rotation;
    this._center.copy(this.obb.center);
    this.apply();
  }

  revert() {
    this.x = this._x;
    this.y = this._y;
    this.width = this._width;
    this.height = this._height;
    this.rotation = this._rotation;
    this.skewX = this._skewX;
    this.skewY = this._skewY;
    this.apply();
  }

  reset() {
    this._obb.min.put(+Infinity);
    this._obb.max.put(-Infinity);

    this._snapshots.clear();

    for (let i = 0; i < this.selection.length; i++) {
      const renderable = this.selection[i];
      this._single = this._snapshot(renderable);
      if (this.selection.length > 1) this._obb.merge(getBBox(renderable));
    }

    if (this.selection.length === 1) {
      this._obb.copy(getBBox(this.selection[0]));
    }

    this.obb.copy(this._obb);
    this._center.copy(this.obb.center);

    this.x = this._x = 0;
    this.y = this._y = 0;
    this.width = this._width = this.obb.width;
    this.height = this._height = this.obb.height;
    this.scaleX = this._scaleX = 1;
    this.scaleY = this._scaleY = 1;
    this.skewX = this._skewX = 0;
    this.skewY = this._skewY = 0;
    this.rotation = this._rotation = 0;
  }

  translate(delta: Point) {
    this.x = this._x + delta.x;
    this.y = this._y + delta.y;
  }

  rotate(handle: Point, delta: Point) {
    const start = v(handle);
    const end = v(start).translate(delta.x, delta.y);
    const anchor = this._center;

    const [startLocal, endLocal, anchorLocal] = this._local(start, end, anchor);

    const AB = v(startLocal).subtract(anchorLocal);
    const AC = v(endLocal).subtract(anchorLocal);

    const dot = AB.dot(AC);
    const cross = AB.cross(AC);
    const angle = Math.atan2(cross, dot);

    this.rotation = this._rotation + angle;

    const [dx, dy] = this._adjust(anchor);
    this.x = this._x + dx;
    this.y = this._y + dy;

    this.apply();
  }

  resize(handle: Point, delta: Point) {
    const start = v(handle);
    const end = v(start).translate(delta.x, delta.y);
    const anchor = v(this._center).scale(2).subtract(start);

    const [startLocal, endLocal, anchorLocal] = this._local(start, end, anchor);

    const startDims = v(startLocal).subtract(anchorLocal);
    const endDims = v(endLocal).subtract(anchorLocal);

    const signX = Math.sign(startDims.x * endDims.x);
    const signY = Math.sign(startDims.y * endDims.y);

    const sx = (Math.abs(endDims.x) / this._width) * signX;
    const sy = (Math.abs(endDims.y) / this._height) * signY;

    const [dx, dy] = this._adjust(anchor, sx, sy);

    if (!epsilon(startLocal.x)) {
      this.x = this._x + dx;
      this.width = Math.abs(endDims.x);
      this.scaleX = signX;
    }

    if (!epsilon(startLocal.y)) {
      this.y = this._y + dy;
      this.height = Math.abs(endDims.y);
      this.scaleY = signY;
    }

    this.apply();
  }

  _applySingle() {
    const [renderable] = this.selection;
    const { width, height } = this._obb;

    const sx = width !== 0 ? this.scaleX * (this.width / width) : 1;
    const sy = height !== 0 ? this.scaleY * (this.height / height) : 1;

    const transform = {
      x: this._single.x + this.x,
      y: this._single.y + this.y,
      scaleX: this._single.scaleX * sx,
      scaleY: this._single.scaleY * sy,
      skewX: this._single.skewX + this.skewX,
      skewY: this._single.skewY + this.skewY,
      rotation: this._single.rotation + this.rotation,
    };

    renderable.width = this._single.width;
    renderable.height = this._single.height;

    this._transform
      .identity()
      .compose(transform)
      .transform(this._single!.invParentTransform)
      .decompose(renderable, true);

    renderable.update();
    this.obb.copy(renderable.obb);
  }

  _applyMultiple() {
    const [cx, cy] = this._obb.center;
    const sx = this.scaleX * (this.width / this._obb.width);
    const sy = this.scaleY * (this.height / this._obb.height);

    this._transform
      .identity()
      .translate(-cx, -cy)
      .scale(sx, sy)
      .compose(this)
      .translate(+cx, +cy);

    for (let i = 0; i < this.selection.length; i++) {
      const renderable = this.selection[i];
      const snapshot = this._snapshots.get(renderable)!;

      renderable.width = snapshot.width;
      renderable.height = snapshot.height;

      this._selectionTransform
        .copy(snapshot.transform)
        .transform(this._transform)
        .transform(snapshot.invParentTransform)
        .decompose(renderable, true);

      renderable.update();
    }

    this.obb.copy(this._obb).transform(this._transform);
  }

  _snapshot(renderable: Renderable) {
    const localTransform = new Matrix3().compose(renderable);
    const parentTransform = new Matrix3(renderable.parent?.transform);
    const invParentTransform = new Matrix3(parentTransform).invert();
    const transform = new Matrix3(localTransform).transform(parentTransform);

    const decomposed = transform.decompose();
    decomposed.width = renderable.width;
    decomposed.height = renderable.height;

    const snapshot = { ...decomposed, transform, invParentTransform };
    this._snapshots.set(renderable, snapshot);
    return snapshot;
  }

  _adjust(anchor: Vec2, sx = this.scaleX, sy = this.scaleY) {
    const center =
      this.selection.length === 1 //
        ? this.selection[0].center
        : this._center;

    return this._delta
      .put(0)
      .add(center)
      .subtract(anchor)
      .scale(sx / this._scaleX, sy / this._scaleY)
      .skew(this.skewX - this._skewX, this.skewY - this._skewY)
      .rotate(this.rotation - this._rotation)
      .add(anchor)
      .subtract(center);
  }

  _local(...vectors: Vec2[]) {
    const locals = new Array<Vec2>(vectors.length);

    const { rotation, skewX, skewY } =
      this.selection.length === 1 //
        ? this.selection[0]
        : this;

    this._transform
      .identity()
      .skew(skewX, skewY)
      .rotate(rotation)
      .translate(this._center.x, this._center.y)
      .invert();

    for (let i = 0; i < vectors.length; i++) {
      locals[i] = v(vectors[i]).transform(this._transform);
    }

    return locals;
  }
}

function epsilon(a: number, b = 0) {
  return Math.abs(a - b) < 1e-8;
}
