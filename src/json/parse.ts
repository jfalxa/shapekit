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
import { Group } from "../renderables/group";
import { Image } from "../renderables/image";
import { Renderable } from "../renderables/renderable";
import { Shape } from "../renderables/shape";
import { Text } from "../renderables/text";
import { ConicGradient } from "../styles/conic-gradient";
import { LinearGradient } from "../styles/linear-gradient";
import { Pattern } from "../styles/pattern";
import { RadialGradient } from "../styles/radial-gradient";
import { Style } from "../styles/style";
import {
  SerializedRenderable,
  SerializedSegment,
  SerializedStyle,
} from "./serialize";

export function parse(renderable: SerializedRenderable): Renderable {
  if (renderable.type === "Group") {
    return new Group({
      ...renderable,
      children: renderable.children.map(parse),
    });
  } else if (renderable.type === "Clip") {
    return new Clip({
      ...renderable,
      path: renderable.path.map(parseSegment),
    });
  } else if (renderable.type === "Shape") {
    return new Shape({
      ...renderable,
      path: renderable.path.map(parseSegment),
      fill: parseStyle(renderable.fill),
      stroke: parseStyle(renderable.stroke),
    });
  } else if (renderable.type === "Text") {
    return new Text({
      ...renderable,
      textFill: parseStyle(renderable.textFill),
      textStroke: parseStyle(renderable.textStroke),
    });
  } else if (renderable.type === "Image") {
    return new Image({
      ...renderable,
      image: parseImage(renderable.image),
    });
  } else {
    throw new Error("Renderable not recognized");
  }
}

function parseSegment(segment: SerializedSegment): Segment {
  if (segment.type === "ArcTo") {
    return new ArcTo(
      segment.x1,
      segment.y1,
      segment.x2,
      segment.y2,
      segment.radius
    );
  } else if (segment.type === "Arc") {
    return new Arc(
      segment.x,
      segment.y,
      segment.radius,
      segment.startAngle,
      segment.endAngle,
      segment.counterclockwise
    );
  } else if (segment.type === "BezierCurveTo") {
    if (segment.cp1x !== undefined && segment.cp1y !== undefined) {
      return new BezierCurveTo(
        segment.cp1x,
        segment.cp1y,
        segment.cp2x,
        segment.cp2y,
        segment.x,
        segment.y
      );
    } else {
      return new BezierCurveTo(
        segment.cp2x,
        segment.cp2y,
        segment.x,
        segment.y
      );
    }
  } else if (segment.type === "ClosePath") {
    return new ClosePath();
  } else if (segment.type === "Ellipse") {
    return new Ellipse(
      segment.x,
      segment.y,
      segment.radiusX,
      segment.radiusY,
      segment.rotation,
      segment.startAngle,
      segment.endAngle,
      segment.counterclockwise
    );
  } else if (segment.type === "LineTo") {
    return new LineTo(
      segment.x, //
      segment.y
    );
  } else if (segment.type === "MoveTo") {
    return new MoveTo(
      segment.x, //
      segment.y
    );
  } else if (segment.type === "QuadraticCurveTo") {
    if (segment.cpx !== undefined && segment.cpy !== undefined) {
      return new QuadraticCurveTo(
        segment.cpx,
        segment.cpy,
        segment.x,
        segment.y
      );
    } else {
      return new QuadraticCurveTo(
        segment.x, //
        segment.y
      );
    }
  } else if (segment.type === "RoundRect") {
    return new RoundRect(
      segment.x,
      segment.y,
      segment.width,
      segment.height,
      segment.radii
    );
  } else if (segment.type === "Rect") {
    return new Rect(segment.x, segment.y, segment.width, segment.height);
  } else {
    throw new Error("Segment not recognized");
  }
}

function parseStyle(style: SerializedStyle | undefined): Style | undefined {
  if (typeof style === "string" || style === undefined) {
    return style;
  } else if (style.type === "ConicGradient") {
    return new ConicGradient(
      style.x, //
      style.y,
      style.startAngle,
      style.stops
    );
  } else if (style.type === "LinearGradient") {
    return new LinearGradient(
      style.x0,
      style.y0,
      style.x1,
      style.y1,
      style.stops
    );
  } else if (style.type === "RadialGradient") {
    return new RadialGradient(
      style.x0,
      style.y0,
      style.r0,
      style.x1,
      style.y1,
      style.r1,
      style.stops
    );
  } else if (style.type === "Pattern") {
    return new Pattern(
      parseImage(style.image), //
      style.repetition
    );
  } else {
    throw new Error("Style not recognized");
  }
}

function parseImage(src: string) {
  const image = document.createElement("img");
  image.src = src;
  return image;
}
