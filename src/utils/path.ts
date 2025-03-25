import { Point } from "../geometry/vec2";

export function createPath(points: Point[], close?: boolean) {
  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  if (close) path.closePath();
  return path;
}
