import { Matrix3 } from "../math/mat3";
import { Vec2 } from "../math/vec2";
import { Group } from "./group";
import { Shape } from "./shape";

export interface Renderable {
  parent?: Group;

  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;

  transformation: Matrix3;

  contains(_shape: Vec2 | Shape): boolean;
  overlaps(_shape: Shape): boolean;
  update(): void;
}
