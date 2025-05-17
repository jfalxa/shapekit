import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Clip } from "../renderables/clip";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { getStyle } from "../styles/style";
import { Path } from "../paths/path";
import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { Arc } from "../paths/arc";
import { ClosePath } from "../paths/close-path";
import { Ellipse } from "../paths/ellipse";
import { LineTo } from "../paths/line-to";
import { MoveTo } from "../paths/move-to";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Rect } from "../paths/rect";
import { RoundRect } from "../paths/round-rect";
import { Matrix3 } from "../math/mat3";

interface Canvas2DInit {
  width: number;
  height: number;
  fill?: string;
}

interface CanvasData {
  transform: Matrix3;
  path2D: Path2D;
}

export class Canvas2D {
  scene: Group;
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  fill: string;

  constructor(scene: Group, init: Canvas2DInit) {
    this.scene = scene;
    this.element = document.createElement("canvas");
    this.element.width = init.width;
    this.element.height = init.height;

    const ctx = this.element.getContext("2d");
    if (!ctx) throw new Error("Cannot access 2D context");
    this.ctx = ctx;

    this.fill = init.fill ?? "#ffffff";
  }

  update() {
    this.scene.walk((r) => {
      if (r.__dirty) this._updateTransform(r);
      if (r instanceof Shape && r.path.__dirty) this._updatePath2D(r);
    });

    this.ctx.resetTransform();

    this.set("fillStyle", this.fill);
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    this.render(this.scene);
  }

  render(renderable: Renderable<CanvasData>) {
    if (renderable instanceof Shape) {
      const t = renderable.__cache.transform;
      this.ctx.setTransform(t[0], t[1], t[3], t[4], t[6], t[7]);
    }

    if (renderable instanceof Clip) {
      return this.renderClip(renderable);
    }

    this.ctx.save();

    if (renderable instanceof Group) {
      this.renderGroup(renderable);
    }

    if (renderable instanceof Shape) {
      this.applyEffects(renderable);

      if (renderable.fill) this.renderFill(renderable);
      if (renderable.stroke) this.renderStroke(renderable);
      if (renderable instanceof Image) this.renderImage(renderable);
      if (renderable instanceof Text) this.renderText(renderable);
    }

    this.ctx.restore();
  }

  renderClip(clip: Clip<CanvasData>) {
    this.ctx.clip(clip.__cache.path2D, clip.fillRule);
  }

  renderGroup(group: Group) {
    this.set("globalCompositeOperation", group.globalCompositeOperation);

    for (let i = 0; i < group.children.length; i++) {
      this.render(group.children[i]);
    }
  }

  renderFill(shape: Shape<CanvasData>) {
    this.set("fillStyle", getStyle(this.ctx, shape.fill));
    this.ctx.fill(shape.__cache.path2D);
  }

  renderStroke(shape: Shape<CanvasData>) {
    this.set("lineWidth", shape.lineWidth);
    this.set("lineCap", shape.lineCap);
    this.set("lineJoin", shape.lineJoin);
    this.set("miterLimit", shape.miterLimit);
    this.set("strokeStyle", getStyle(this.ctx, shape.stroke));
    this.set("lineDashOffset", shape.lineDashOffset);
    if (shape.lineDash) this.ctx.setLineDash(shape.lineDash);
    this.ctx.stroke(shape.__cache.path2D);
  }

  renderImage(image: Image) {
    this.ctx.drawImage(image.image, 0, 0, image.width, image.height);
  }

  renderText(text: Text) {
    this.set("font", text.font);
    this.set("textAlign", text.textAlign);
    this.set("textBaseline", text.textBaseline);
    this.set("fillStyle", getStyle(this.ctx, text.textFill));
    this.set("strokeStyle", getStyle(this.ctx, text.textStroke));
    this.set("lineWidth", text.textLineWidth);

    for (let i = 0; i < text.lines.length; i++) {
      const [line, x, y] = text.lines[i];
      if (text.textFill) this.ctx.fillText(line, x, y);
      if (text.textStroke) this.ctx.strokeText(line, x, y);
    }
  }

  applyEffects(shape: Shape) {
    this.set("globalAlpha", shape.globalAlpha);
    this.set("filter", shape.filter);
    this.set("shadowBlur", shape.shadowBlur);
    this.set("shadowColor", shape.shadowColor);
    this.set("shadowOffsetX", shape.shadowOffsetX);
    this.set("shadowOffsetY", shape.shadowOffsetY);
  }

  set<K extends keyof CanvasRenderingContext2D>(
    property: K,
    value: CanvasRenderingContext2D[K] | undefined
  ) {
    if (value !== undefined && this.ctx[property] !== value) {
      this.ctx[property] = value;
    }
  }

  private _updateTransform(renderable: Renderable<CanvasData>) {
    if (renderable.parent?.__dirty) renderable.__dirty = true;
    if (!renderable.__dirty) return;

    let t = renderable.__cache.transform;
    if (!t) {
      t = new Matrix3();
      renderable.__cache.transform = t;
    }

    t.identity().compose(renderable);
    if (renderable.parent) t.transform(renderable.parent.__cache.transform);
  }

  private _updatePath2D(shape: Shape<CanvasData>) {
    const path2D = buildPath2D(shape.path);
    shape.__cache.path2D = path2D;
    shape.path.__dirty = false;
  }
}

function buildPath2D(path: Path) {
  const path2D = new Path2D();

  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    s.__dirty = false;
    if (s instanceof ArcTo) {
      path2D.arcTo(s.x1, s.y1, s.x2, s.y2, s.radius);
    } else if (s instanceof Arc) {
      path2D.arc(s.x, s.y, s.radius, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
    } else if (s instanceof BezierCurveTo) {
      path2D.bezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y);
    } else if (s instanceof ClosePath) {
      path2D.closePath();
    } else if (s instanceof Ellipse) {
      path2D.ellipse(s.x, s.y, s.radiusX, s.radiusY, s.rotation, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
    } else if (s instanceof LineTo) {
      path2D.lineTo(s.x, s.y);
    } else if (s instanceof MoveTo) {
      path2D.moveTo(s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      path2D.quadraticCurveTo(s.cpx, s.cpy, s.x, s.y);
    } else if (s instanceof Rect) {
      path2D.rect(s.x, s.y, s.width, s.height);
    } else if (s instanceof RoundRect) {
      path2D.roundRect(s.x, s.y, s.width, s.height, s.radius);
    }
  }

  return path2D;
}
