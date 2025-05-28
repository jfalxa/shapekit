import { LightGroup } from "../renderables/light-group";
import { Image } from "../renderables/image";
import { Clip } from "../renderables/clip";
import { Renderable } from "../renderables/renderable";
import { LightShape } from "../renderables/light-shape";
import { Text } from "../renderables/text";
import { getStyle, Style } from "../styles/style";
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

export interface Canvas2DInit {
  width: number;
  height: number;
  fill?: Style;
}

export class Canvas2D {
  scene: LightGroup;
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  fill: Style;

  constructor(scene: LightGroup, init: Canvas2DInit) {
    this.scene = scene;
    this.element = document.createElement("canvas");
    this.element.width = init.width;
    this.element.height = init.height;

    const ctx = this.element.getContext("2d");
    if (!ctx) throw new Error("Cannot access 2D context");
    this.ctx = ctx;

    this.fill = init.fill ?? "#ffffff";
  }

  set<K extends keyof CanvasRenderingContext2D>(
    property: K,
    value: CanvasRenderingContext2D[K] | undefined
  ) {
    if (value !== undefined && this.ctx[property] !== value) {
      this.ctx[property] = value;
    }
  }

  update() {
    this.ctx.resetTransform();
    this.set("fillStyle", getStyle(this.ctx, this.fill));
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    this.scene.update();
    this.render(this.scene);
  }

  render(renderable: Renderable) {
    if (renderable instanceof LightShape) {
      const t = renderable.transform;
      this.ctx.setTransform(t[0], t[1], t[3], t[4], t[6], t[7]);
    }

    if (renderable instanceof Clip) {
      return this._renderClip(renderable);
    }

    this.ctx.save();

    if (renderable instanceof LightGroup) {
      this._renderGroup(renderable);
    } else if (renderable instanceof Image) {
      this._renderImage(renderable);
    } else if (renderable instanceof Text) {
      this._renderText(renderable);
    } else if (renderable instanceof LightShape) {
      this._applyEffects(renderable);
      if (renderable.fill) this._renderFill(renderable);
      if (renderable.stroke) this._renderStroke(renderable);
    }

    this.ctx.restore();
  }

  private _renderClip(clip: Clip) {
    this.ctx.clip(this._getPath2D(clip), clip.fillRule);
  }

  private _renderGroup(group: LightGroup) {
    this.set("globalCompositeOperation", group.globalCompositeOperation);

    for (let i = 0; i < group.children.length; i++) {
      this.render(group.children[i]);
    }
  }

  private _renderFill(shape: LightShape) {
    this.set("fillStyle", getStyle(this.ctx, shape.fill));
    this.ctx.fill(this._getPath2D(shape));
  }

  private _renderStroke(shape: LightShape) {
    this.set("lineWidth", shape.lineWidth);
    this.set("lineCap", shape.lineCap);
    this.set("lineJoin", shape.lineJoin);
    this.set("miterLimit", shape.miterLimit);
    this.set("strokeStyle", getStyle(this.ctx, shape.stroke));
    this.set("lineDashOffset", shape.lineDashOffset);
    if (shape.lineDash) this.ctx.setLineDash(shape.lineDash);
    this.ctx.stroke(this._getPath2D(shape));
  }

  private _renderImage(image: Image) {
    this.ctx.drawImage(image.image, 0, 0, image.width, image.height);
  }

  private _renderText(text: Text) {
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

  private _applyEffects(shape: LightShape) {
    this.set("globalAlpha", shape.globalAlpha);
    this.set("filter", shape.filter);
    this.set("shadowBlur", shape.shadowBlur);
    this.set("shadowColor", shape.shadowColor);
    this.set("shadowOffsetX", shape.shadowOffsetX);
    this.set("shadowOffsetY", shape.shadowOffsetY);
  }

  private _getPath2D(shape: LightShape) {
    if (shape.path.isDirty) {
      const path2D = buildPath2D(shape.path);
      shape.path.path2D = path2D;
      shape.path.isDirty = false;
    }
    return shape.path.path2D!;
  }
}

function buildPath2D(path: Path) {
  const path2D = new Path2D();

  for (let i = 0; i < path.length; i++) {
    const s = path[i];
    s.link(path[i - 1]);
    if (s instanceof ArcTo) {
      path2D.arcTo(s.x1, s.y1, s.x2, s.y2, s.radius);
    } else if (s instanceof Arc) {
      path2D.arc(s.x, s.y, s.radius, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
    } else if (s instanceof BezierCurveTo) {
      path2D.bezierCurveTo(s._cp1x, s._cp1y, s.cp2x, s.cp2y, s.x, s.y);
    } else if (s instanceof ClosePath) {
      path2D.closePath();
    } else if (s instanceof Ellipse) {
      path2D.ellipse(s.x, s.y, s.radiusX, s.radiusY, s.rotation, s.startAngle, s.endAngle, s.counterclockwise); // prettier-ignore
    } else if (s instanceof LineTo) {
      path2D.lineTo(s.x, s.y);
    } else if (s instanceof MoveTo) {
      path2D.moveTo(s.x, s.y);
    } else if (s instanceof QuadraticCurveTo) {
      path2D.quadraticCurveTo(s._cpx, s._cpy, s.x, s.y);
    } else if (s instanceof Rect) {
      path2D.rect(s.x, s.y, s.width, s.height);
    } else if (s instanceof RoundRect) {
      path2D.roundRect(s.x, s.y, s.width, s.height, s.radius);
    }
  }

  return path2D;
}
