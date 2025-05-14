import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Clip } from "../renderables/clip";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { getStyle } from "../styles/style";

interface Canvas2DInit {
  width: number;
  height: number;
  fill?: string;
}

export class Canvas2D extends Group {
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  fill: string;

  constructor(init: Canvas2DInit) {
    super({});
    this.element = document.createElement("canvas");
    this.element.width = init.width;
    this.element.height = init.height;

    const ctx = this.element.getContext("2d");
    if (!ctx) throw new Error("Cannot access 2D context");
    this.ctx = ctx;

    this.fill = init.fill ?? "#ffffff";
  }

  render() {
    this.ctx.resetTransform();

    this.set("fillStyle", this.fill);
    this.ctx.fillRect(0, 0, this.element.width, this.element.height);

    for (let i = 0; i < this.children.length; i++) {
      this.renderOne(this.children[i]);
    }
  }

  renderOne(renderable: Renderable) {
    if (renderable instanceof Shape) {
      this.ctx.setTransform(
        renderable.transform[0],
        renderable.transform[1],
        renderable.transform[3],
        renderable.transform[4],
        renderable.transform[6],
        renderable.transform[7]
      );
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

  renderClip(clip: Clip) {
    this.ctx.clip(clip.path.path2D, clip.fillRule);
  }

  renderGroup(group: Group) {
    this.set("globalCompositeOperation", group.globalCompositeOperation);

    for (let i = 0; i < group.children.length; i++) {
      this.renderOne(group.children[i]);
    }
  }

  renderFill(shape: Shape) {
    this.set("fillStyle", getStyle(this.ctx, shape.fill));
    this.ctx.fill(shape.path.path2D);
  }

  renderStroke(shape: Shape) {
    this.set("lineWidth", shape.lineWidth);
    this.set("lineCap", shape.lineCap);
    this.set("lineJoin", shape.lineJoin);
    this.set("miterLimit", shape.miterLimit);
    this.set("strokeStyle", getStyle(this.ctx, shape.stroke));
    this.set("lineDashOffset", shape.lineDashOffset);
    if (shape.lineDash) this.ctx.setLineDash(shape.lineDash);
    this.ctx.stroke(shape.path.path2D);
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
    this.set("lineDashOffset", text.lineDashOffset);
    if (text.lineDash) this.ctx.setLineDash(text.lineDash);

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
}
