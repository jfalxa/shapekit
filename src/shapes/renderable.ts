import { Vec2 } from "../math/vec2";
import { BoundingBox } from "../utils/bounding-box";
import { Shape } from "./shape";

export interface Renderable {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  aabb: BoundingBox;

  contains(_shape: Vec2 | Shape): boolean;
  overlaps(_shape: Shape): boolean;
  update(): void;
  translate(_tx: number, _ty: number): void;
  scale(_sx: number, _sy: number, _from?: Vec2): void;
  rotate(_angle: number, _from?: Vec2): void;
}
