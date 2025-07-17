import { Arc } from "../paths/arc";
import { ArcTo } from "../paths/arc-to";
import { BezierCurveTo } from "../paths/bezier-curve-to";
import { ClosePath } from "../paths/close-path";
import { Ellipse } from "../paths/ellipse";
import { LineTo } from "../paths/line-to";
import { MoveTo } from "../paths/move-to";
import { QuadraticCurveTo } from "../paths/quadratic-curve-to";
import { Rect } from "../paths/rect";
import { RoundRect } from "../paths/round-rect";
import { Segment } from "../paths/segment";
import { Clip } from "../renderables/clip";
import { Group, GroupStyle } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable, RenderableInit } from "../renderables/renderable";
import { Shape, ShapeStyle } from "../renderables/shape";
import { Text, TextStyle } from "../renderables/text";
import { ConicGradient } from "../styles/conic-gradient";
import { GradientStops } from "../styles/gradient";
import { LinearGradient } from "../styles/linear-gradient";
import { Pattern, PatternRepetition } from "../styles/pattern";
import { RadialGradient } from "../styles/radial-gradient";
import { Style } from "../styles/style";

export function serialize(renderable: Renderable): SerializedRenderable {
  if (renderable instanceof Group) {
    return compact({
      type: "Group",
      globalCompositeOperation: renderable.globalCompositeOperation,
      children: renderable.children.map(serialize),
      ...serializeRenderable(renderable),
    });
  } else if (renderable instanceof Clip) {
    return compact({
      type: "Clip",
      fillRule: renderable.fillRule,
      path: Array.from(renderable.path).map(serializeSegment),
      ...serializeRenderable(renderable),
    });
  } else if (renderable instanceof Shape) {
    return compact({
      type: "Shape",
      lineWidth: renderable.lineWidth,
      lineCap: renderable.lineCap,
      lineJoin: renderable.lineJoin,
      lineDashOffset: renderable.lineDashOffset,
      miterLimit: renderable.miterLimit,
      shadowBlur: renderable.shadowBlur,
      shadowColor: renderable.shadowColor,
      shadowOffsetX: renderable.shadowOffsetX,
      shadowOffsetY: renderable.shadowOffsetY,
      globalAlpha: renderable.globalAlpha,
      filter: renderable.filter,
      lineDash: renderable.lineDash,
      path: Array.from(renderable.path).map(serializeSegment),
      fill: serializeStyle(renderable.fill),
      stroke: serializeStyle(renderable.stroke),
      ...serializeRenderable(renderable),
    });
  } else if (renderable instanceof Text) {
    return compact({
      type: "Text",
      text: renderable.text,
      width: renderable.width,
      height: renderable.height,
      fontFamily: renderable.fontFamily,
      fontSize: renderable.fontSize,
      fontStretch: renderable.fontStretch,
      fontStyle: renderable.fontStyle,
      fontVariant: renderable.fontVariant,
      fontWeight: renderable.fontWeight,
      lineHeight: renderable.lineHeight,
      textLineWidth: renderable.textLineWidth,
      textAlign: renderable.textAlign,
      textBaseline: renderable.textBaseline,
      textVerticalAlign: renderable.textVerticalAlign,
      direction: renderable.direction,
      padding: renderable.padding,
      textFill: serializeStyle(renderable.textFill),
      textStroke: serializeStyle(renderable.textStroke),
      ...serializeRenderable(renderable),
    });
  } else if (renderable instanceof Image) {
    return compact({
      type: "Image",
      width: renderable.width,
      height: renderable.height,
      image: serializeImage(
        renderable.image,
        renderable.getWidth(),
        renderable.getHeight()
      ),
      ...serializeRenderable(renderable),
    });
  } else {
    throw new Error("Renderable not recognized");
  }
}

function serializeSegment(segment: Segment): SerializedSegment {
  if (segment instanceof ArcTo) {
    return {
      type: "ArcTo",
      x1: segment.cpx,
      y1: segment.cpy,
      x2: segment.x,
      y2: segment.y,
      radius: segment.radiusX,
    };
  } else if (segment instanceof Arc) {
    return {
      type: "Arc",
      x: segment.x,
      y: segment.y,
      radius: segment.radiusX,
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      counterclockwise: segment.counterclockwise,
    };
  } else if (segment instanceof BezierCurveTo) {
    return {
      type: "BezierCurveTo",
      cp1x: segment.cp1x,
      cp1y: segment.cp1y,
      cp2x: segment.cp2x,
      cp2y: segment.cp2y,
      x: segment.x,
      y: segment.y,
    };
  } else if (segment instanceof ClosePath) {
    return {
      type: "ClosePath",
    };
  } else if (segment instanceof Ellipse) {
    return {
      type: "Ellipse",
      x: segment.x,
      y: segment.y,
      radiusX: segment.radiusX,
      radiusY: segment.radiusY,
      rotation: segment.rotation,
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      counterclockwise: segment.counterclockwise,
    };
  } else if (segment instanceof LineTo) {
    return {
      type: "LineTo",
      x: segment.x,
      y: segment.y,
    };
  } else if (segment instanceof MoveTo) {
    return {
      type: "MoveTo",
      x: segment.x,
      y: segment.y,
    };
  } else if (segment instanceof QuadraticCurveTo) {
    return {
      type: "QuadraticCurveTo",
      cpx: segment.cpx,
      cpy: segment.cpy,
      x: segment.x,
      y: segment.y,
    };
  } else if (segment instanceof RoundRect) {
    return {
      type: "RoundRect",
      x: segment.x,
      y: segment.y,
      width: segment.width,
      height: segment.height,
      radii: segment.radii,
    };
  } else if (segment instanceof Rect) {
    return {
      type: "Rect",
      x: segment.x,
      y: segment.y,
      width: segment.width,
      height: segment.height,
    };
  } else {
    throw new Error("Segment not recognized");
  }
}

function serializeStyle(style: Style | undefined): SerializedStyle | undefined {
  if (style instanceof ConicGradient) {
    return {
      type: "ConicGradient",
      x: style.x,
      y: style.y,
      startAngle: style.startAngle,
      stops: style.stops,
    };
  } else if (style instanceof LinearGradient) {
    return {
      type: "LinearGradient",
      x0: style.x0,
      y0: style.y0,
      x1: style.x1,
      y1: style.y1,
      stops: style.stops,
    };
  } else if (style instanceof RadialGradient) {
    return {
      type: "RadialGradient",
      x0: style.x0,
      y0: style.y0,
      r0: style.r0,
      x1: style.x1,
      y1: style.y1,
      r1: style.r1,
      stops: style.stops,
    };
  } else if (style instanceof Pattern) {
    return {
      type: "Pattern",
      image: serializeImage(style.image),
      repetition: style.repetition,
    };
  } else if (typeof style === "string" || style === undefined) {
    return style;
  } else {
    throw new Error("Style not recognized");
  }
}

function serializeRenderable(renderable: Renderable) {
  return {
    id: renderable.id,
    hidden: renderable.hidden,
    x: renderable.x,
    y: renderable.y,
    scaleX: renderable.scaleX,
    scaleY: renderable.scaleY,
    skewX: renderable.skewX,
    skewY: renderable.skewY,
    rotation: renderable.rotation,
  };
}

function serializeImage(
  source: CanvasImageSource,
  width?: number,
  height?: number,
  mimeType = "image/webp",
  quality = 1.0
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context is not accessible");
  const [naturalWidth, naturalHeight] = Image.dimensions(source);
  canvas.width = width ?? naturalWidth;
  canvas.height = height ?? naturalHeight;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(mimeType, quality);
}

function compact<T extends object>(obj: T): T {
  for (const key in obj) {
    if (!obj[key]) delete obj[key];
  }
  return obj;
}

export type SerializedRenderable =
  | SerializedGroup
  | SerializedClip
  | SerializedShape
  | SerializedText
  | SerializedImage;

interface SerializedGroup extends RenderableInit, GroupStyle {
  type: "Group";
  children: SerializedRenderable[];
}

interface SerializedClip extends RenderableInit {
  type: "Clip";
  fillRule?: CanvasFillRule;
  path: SerializedSegment[];
}

interface SerializedShape
  extends RenderableInit,
    Omit<ShapeStyle, "fill" | "stroke"> {
  type: "Shape";
  fillRule?: CanvasFillRule;
  fill?: SerializedStyle;
  stroke?: SerializedStyle;
  path: SerializedSegment[];
}

interface SerializedText
  extends RenderableInit,
    Omit<TextStyle, "textFill" | "textStroke"> {
  type: "Text";
  text: string;
  textFill?: SerializedStyle;
  textStroke?: SerializedStyle;
  width?: number;
  height?: number;
}

interface SerializedImage extends RenderableInit {
  type: "Image";
  image: string;
  width?: number;
  height?: number;
}

export type SerializedSegment =
  | SerializedArcTo
  | SerializedArc
  | SerializedBezierCurveTo
  | SerializedClosePath
  | SerializedEllipse
  | SerializedLineTo
  | SerializedMoveTo
  | SerializedQuadraticCurveTo
  | SerializedRoundRect
  | SerializedRect;

interface SerializedArcTo {
  type: "ArcTo";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius: number;
}

interface SerializedArc {
  type: "Arc";
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  counterclockwise: boolean;
}

interface SerializedBezierCurveTo {
  type: "BezierCurveTo";
  cp1x?: number;
  cp1y?: number;
  cp2x: number;
  cp2y: number;
  x: number;
  y: number;
}

interface SerializedClosePath {
  type: "ClosePath";
}

interface SerializedEllipse {
  type: "Ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  startAngle: number;
  endAngle: number;
  counterclockwise?: boolean;
}

interface SerializedLineTo {
  type: "LineTo";
  x: number;
  y: number;
}

interface SerializedMoveTo {
  type: "MoveTo";
  x: number;
  y: number;
}

interface SerializedQuadraticCurveTo {
  type: "QuadraticCurveTo";
  cpx?: number;
  cpy?: number;
  x: number;
  y: number;
}

interface SerializedRoundRect {
  type: "RoundRect";
  x: number;
  y: number;
  width: number;
  height: number;
  radii?: number | [number, number, number, number];
}

interface SerializedRect {
  type: "Rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SerializedStyle =
  | SerializedConicGradient
  | SerializedLinearGradient
  | SerializedRadialGradient
  | SerializedPattern
  | string;

interface SerializedConicGradient {
  type: "ConicGradient";
  x: number;
  y: number;
  startAngle: number;
  stops: GradientStops;
}

interface SerializedLinearGradient {
  type: "LinearGradient";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stops: GradientStops;
}

interface SerializedRadialGradient {
  type: "RadialGradient";
  x0: number;
  y0: number;
  r0: number;
  x1: number;
  y1: number;
  r1: number;
  stops: GradientStops;
}

interface SerializedPattern {
  type: "Pattern";
  image: string;
  repetition: PatternRepetition;
}
