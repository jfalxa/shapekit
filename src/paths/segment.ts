import { Vec2 } from "../math/vec2";

export abstract class Segment {
  previous?: Segment;

  min = new Vec2();
  max = new Vec2();

  _from = new Vec2();
  _to: Vec2;

  protected points: Vec2[];

  constructor(public x: number, public y: number) {
    this._to = new Vec2(x, y);
    this.points = [new Vec2()];
  }

  abstract apply(path: Path2D): void;

  scale(sx: number, sy: number) {
    this._to.put(this.x, this.y).scale(sx, sy);
  }

  sample(_quality: number) {
    this.points[0].copy(this._to);
    return this.points;
  }

  link(previous: Segment | undefined) {
    this.previous = previous;
    if (previous) this._from.copy(previous._to);
    else this._from.put(0);
  }

  aabb() {
    this.min.copy(this._to);
    this.max.copy(this._to);
    return this;
  }
}

export abstract class ControlledSegment extends Segment {
  _currentControl: Vec2;

  constructor(x: number, y: number) {
    super(x, y);
    this._currentControl = new Vec2();
  }

  abstract getSharedControlPoint(): Vec2;
  abstract getOptionalControlPoint(): Vec2 | undefined;

  link(previous: Segment | undefined) {
    super.link(previous);

    let control = this.getOptionalControlPoint();

    if (control) {
      this._currentControl.copy(control);
    } else if (previous instanceof ControlledSegment) {
      const sharedControl = previous.getSharedControlPoint();
      this._currentControl.copy(previous._to).scale(2).subtract(sharedControl);
    } else if (previous) {
      this._currentControl.copy(previous._to);
    } else {
      throw new Error("Control point is missing");
    }
  }
}
