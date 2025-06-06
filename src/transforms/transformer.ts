import { Matrix3 } from "../math/mat3";
import { Point, v, Vec2 } from "../math/vec2";
import { BBox } from "../bounds/bbox";
import { Renderable, Transform, walk } from "../renderables/renderable";
import { getBBox, getCenter, getNaturalBBox } from "../bounds/renderable";
import { Segment } from "../paths/segment";
import { Shape } from "../renderables/shape";
import { clonePath, copyPath, scalePath } from "./path";
import { Text } from "../renderables/text";
import { Group } from "../renderables/group";
import { Image } from "../renderables/image";

interface Snapshot extends Transform {
  transform: Matrix3;
  invParentTransform: Matrix3;
  path: Segment[];
  bbox: BBox;
}

export class Transformer {
  selection!: Renderable[];

  x!: number;
  y!: number;
  width!: number;
  height!: number;
  scaleX!: number;
  scaleY!: number;
  skewX!: number;
  skewY!: number;
  rotation!: number;

  bbox = new BBox();

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
  private _center = new Vec2();
  private _delta = new Vec2();
  private _initialBBox = new BBox();
  private _transform = new Matrix3();
  private _selectionTransform = new Matrix3();

  constructor(selection: Renderable[] = []) {
    this.select(...selection);
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
    this._center.copy(this.bbox.center);
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

  select(...renderables: Renderable[]) {
    this.selection = renderables;

    this._initialBBox.min.put(+Infinity);
    this._initialBBox.max.put(-Infinity);

    this._snapshots.clear();

    for (let i = 0; i < this.selection.length; i++) {
      const selected = this.selection[i];
      selected.update();

      walk(selected, (renderable) => {
        this._snapshot(renderable);
      });
    }

    if (this.selection.length === 1) {
      this._initialBBox.copy(getBBox(this.selection[0]));
    } else {
      for (let i = 0; i < this.selection.length; i++) {
        this._initialBBox.merge(getBBox(this.selection[i]));
      }
    }

    this.bbox.copy(this._initialBBox);
    this._center.copy(this.bbox.center);

    this.x = this._x = 0;
    this.y = this._y = 0;
    this.width = this._width = this.bbox.width;
    this.height = this._height = this.bbox.height;
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

  private _applySingle() {
    const [renderable] = this.selection;
    const { width, height } = this._initialBBox;

    const snapshot = this._snapshots.get(renderable)!;

    const sx = width !== 0 ? this.scaleX * (this.width / width) : 1;
    const sy = height !== 0 ? this.scaleY * (this.height / height) : 1;

    const transform = new Matrix3().compose({
      x: snapshot.x + this.x,
      y: snapshot.y + this.y,
      scaleX: snapshot.scaleX * sx,
      scaleY: snapshot.scaleY * sy,
      skewX: snapshot.skewX + this.skewX,
      skewY: snapshot.skewY + this.skewY,
      rotation: snapshot.rotation + this.rotation,
    });

    this._transform
      .identity()
      .transform(transform)
      .transform(snapshot.invParentTransform);

    this._applyTransform(renderable, this._transform);

    renderable.update();
    this.bbox.copy(getBBox(renderable));
  }

  private _applyMultiple() {
    const [cx, cy] = this._initialBBox.center;
    const sx = this.scaleX * (this.width / this._initialBBox.width);
    const sy = this.scaleY * (this.height / this._initialBBox.height);

    this._transform
      .identity()
      .translate(-cx, -cy)
      .scale(sx, sy)
      .compose(this)
      .translate(+cx, +cy);

    for (let i = 0; i < this.selection.length; i++) {
      const renderable = this.selection[i];
      const snapshot = this._snapshots.get(renderable)!;

      this._selectionTransform
        .copy(snapshot.transform)
        .transform(this._transform)
        .transform(snapshot.invParentTransform);

      this._applyTransform(renderable, this._selectionTransform);
      renderable.update();
    }

    this.bbox.copy(this._initialBBox).transform(this._transform);
  }

  private _applyTransform(renderable: Renderable, transform: Matrix3) {
    const snapshot = this._snapshots.get(renderable)!;

    const { scaleX, scaleY, ...decomposed } = transform.decompose();
    Object.assign(renderable, decomposed);

    const sx = scaleX / snapshot.scaleX;
    const sy = scaleY / snapshot.scaleY;

    if (renderable instanceof Shape) {
      scalePath(copyPath(snapshot.path, renderable.path), sx, sy);
    } else if (renderable instanceof Text || renderable instanceof Image) {
      if (renderable.width !== undefined) renderable.width = snapshot.bbox.width * sx; // prettier-ignore
      if (renderable.height !== undefined) renderable.height = snapshot.bbox.height * sy; // prettier-ignore
    } else if (renderable instanceof Group) {
      for (let i = 0; i < renderable.children.length; i++) {
        const child = renderable.children[i];
        const childSnaphost = this._snapshots.get(child)!;
        const childTransform = new Matrix3().compose(childSnaphost).scale(sx, sy); // prettier-ignore
        this._applyTransform(child, childTransform);
      }
    }
  }

  private _snapshot(renderable: Renderable) {
    const localTransform = new Matrix3().compose(renderable);
    const parentTransform = new Matrix3(renderable.parent?.transform);
    const invParentTransform = new Matrix3(parentTransform).invert();
    const transform = new Matrix3(localTransform).transform(parentTransform);
    const bbox = new BBox().copy(getNaturalBBox(renderable));
    const path = renderable instanceof Shape ? clonePath(renderable.path) : [];

    const decomposed = localTransform.decompose();
    const snapshot = { ...decomposed, transform, invParentTransform, bbox, path }; // prettier-ignore
    this._snapshots.set(renderable, snapshot);

    return snapshot;
  }

  _adjust(anchor: Vec2, sx = this.scaleX, sy = this.scaleY) {
    let center =
      this.selection.length === 1 //
        ? getCenter(this.selection[0])
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
