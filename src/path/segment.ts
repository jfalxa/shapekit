import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";

export abstract class Segment {
  from: Vec2;
  to: Vec2;

  min: Vec2;
  max: Vec2;

  protected points: Vec2[];

  constructor(x: number, y: number) {
    this.from = new Vec2(0, 0);
    this.to = new Vec2(x, y);
    this.min = this.to.clone();
    this.max = this.to.clone();
    this.points = [new Vec2(0, 0)];
  }

  link(previous: Segment | undefined) {
    if (previous) {
      this.from.copy(previous.to);
    } else {
      this.from.put(0);
    }
  }

  scale(sx: number, sy: number) {
    this.to.scale(sx, sy);
  }

  abstract apply(path: Path2D): void;
  abstract join(aabb: BoundingBox): void;

  sample(_quality: number) {
    this.points[0].copy(this.to);
    return this.points;
  }
}

export abstract class ControlledSegment extends Segment {
  _control: Vec2;

  constructor(x: number, y: number) {
    super(x, y);
    this._control = new Vec2(0, 0);
  }

  abstract getSharedControlPoint(): Vec2;
  abstract getOptionalControlPoint(): Vec2 | undefined;

  link(previous: Segment | undefined) {
    super.link(previous);

    let control = this.getOptionalControlPoint();

    if (control) {
      this._control.copy(control);
    } else if (previous instanceof ControlledSegment) {
      const sharedControl = previous.getSharedControlPoint();
      this._control.copy(previous.to).scale(2).subtract(sharedControl);
    } else if (previous) {
      this._control.copy(previous.to);
    } else {
      throw new Error("Control point is missing");
    }
  }
}
