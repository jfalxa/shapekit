import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Clip } from "../renderables/clip";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
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
import { Matrix3 } from "../math/mat3";

interface CanvasCache {
  transform: Matrix3;
  path2D: Path2D;
  dirtyTransform: boolean;
  dirtyPath: boolean;
  dirtyText: boolean;
}

export interface Canvas2DInit {
  width: number;
  height: number;
  fill?: Style;
}

export class Canvas2D {
  scene: Group;
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  fill: Style;

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

  set<K extends keyof CanvasRenderingContext2D>(
    property: K,
    value: CanvasRenderingContext2D[K] | undefined
  ) {
    if (value !== undefined && this.ctx[property] !== value) {
      this.ctx[property] = value;
    }
  }

  update() {
    this.scene.walk((r) => {
      const {
        dirtyTransform = true,
        dirtyPath = true,
        dirtyText = true,
      } = r.__cache as CanvasCache;

      if (dirtyTransform) this._updateTransform(r);
      if (r instanceof Shape && dirtyPath) this._updatePath2D(r);
      if (r instanceof Text && dirtyText) this._updateText(r);
    });

    this.ctx.resetTransform();

    this.set("fillStyle", getStyle(this.ctx, this.fill));
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    this.render(this.scene);
  }

  render(renderable: Renderable) {
    if (renderable instanceof Shape) {
      const t = (renderable.__cache as CanvasCache).transform;
      this.ctx.setTransform(t[0], t[1], t[3], t[4], t[6], t[7]);
    }

    if (renderable instanceof Clip) {
      return this._renderClip(renderable);
    }

    this.ctx.save();

    if (renderable instanceof Group) {
      this._renderGroup(renderable);
    }

    if (renderable instanceof Shape) {
      this._applyEffects(renderable);

      if (renderable.fill) this._renderFill(renderable);
      if (renderable.stroke) this._renderStroke(renderable);
      if (renderable instanceof Image) this._renderImage(renderable);
      if (renderable instanceof Text) this._renderText(renderable);
    }

    this.ctx.restore();
  }

  private _renderClip(clip: Clip) {
    this.ctx.clip((clip.__cache as CanvasCache).path2D, clip.fillRule);
  }

  private _renderGroup(group: Group) {
    this.set("globalCompositeOperation", group.globalCompositeOperation);

    for (let i = 0; i < group.children.length; i++) {
      this.render(group.children[i]);
    }
  }

  private _renderFill(shape: Shape) {
    this.set("fillStyle", getStyle(this.ctx, shape.fill));
    this.ctx.fill((shape.__cache as CanvasCache).path2D);
  }

  private _renderStroke(shape: Shape) {
    this.set("lineWidth", shape.lineWidth);
    this.set("lineCap", shape.lineCap);
    this.set("lineJoin", shape.lineJoin);
    this.set("miterLimit", shape.miterLimit);
    this.set("strokeStyle", getStyle(this.ctx, shape.stroke));
    this.set("lineDashOffset", shape.lineDashOffset);
    if (shape.lineDash) this.ctx.setLineDash(shape.lineDash);
    this.ctx.stroke((shape.__cache as CanvasCache).path2D);
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

  private _applyEffects(shape: Shape) {
    this.set("globalAlpha", shape.globalAlpha);
    this.set("filter", shape.filter);
    this.set("shadowBlur", shape.shadowBlur);
    this.set("shadowColor", shape.shadowColor);
    this.set("shadowOffsetX", shape.shadowOffsetX);
    this.set("shadowOffsetY", shape.shadowOffsetY);
  }

  private _updateTransform(renderable: Renderable) {
    const cache = renderable.__cache as CanvasCache;

    if (!cache.transform) cache.transform = new Matrix3();
    cache.transform.identity().compose(renderable);

    if (renderable.parent) {
      const parentCache = renderable.parent.__cache as CanvasCache;
      cache.transform.transform(parentCache.transform);
    }

    cache.dirtyTransform = false;
  }

  private _updatePath2D(shape: Shape) {
    const cache = shape.__cache as CanvasCache;
    const path2D = buildPath2D(shape.path);
    cache.path2D = path2D;
    cache.dirtyPath = false;
  }

  private _updateText(text: Text) {
    const cache = text.__cache as CanvasCache;
    text.format();
    cache.dirtyText = false;
  }
}

function buildPath2D(path: Path) {
  const path2D = new Path2D();

  for (let i = 0; i < path.length; i++) {
    const s = path[i];
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
