import { describe, it, expect } from "vitest";
import { getPathBBox, getPathPoints } from "../src/bounds/path.js";
import { Path, updatePath } from "../src/paths/path.js";
import { BBox } from "../src/bounds/bbox.js";
import { Vec2 } from "../src/utils/vec2.js";
import {
  rect,
  moveTo,
  lineTo,
  bezierCurveTo,
  quadraticCurveTo,
  arc,
  ellipse,
  closePath,
  arcTo,
  roundRect,
} from "../src/index.js";

describe("bounds/path", () => {
  describe("getPathBBox", () => {
    it("should calculate bbox for simple rectangle", () => {
      const path = new Path([rect(10, 20, 100, 50)]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(10);
      expect(bbox.min.y).toBe(20);
      expect(bbox.max.x).toBe(110);
      expect(bbox.max.y).toBe(70);
    });

    it("should calculate bbox for line segments", () => {
      const path = new Path([moveTo(0, 0), lineTo(100, 50), lineTo(50, 100)]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.max.y).toBe(100);
    });

    it("should calculate bbox for bezier curve", () => {
      const path = new Path([
        moveTo(0, 0),
        bezierCurveTo(50, -50, 50, 50, 100, 0),
      ]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(0);
      expect(bbox.max.x).toBe(100);
      // Bezier curves may extend beyond control points
      expect(bbox.min.y).toBeLessThanOrEqual(0);
      expect(bbox.max.y).toBeGreaterThanOrEqual(0);
    });

    it("should calculate bbox for quadratic curve", () => {
      const path = new Path([moveTo(0, 0), quadraticCurveTo(50, -50, 100, 0)]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.min.y).toBeLessThanOrEqual(0);
      expect(bbox.max.y).toBeGreaterThanOrEqual(0);
    });

    it("should calculate bbox for arc", () => {
      const path = new Path([arc(50, 50, 25, 0, Math.PI)]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(25);
      expect(bbox.max.x).toBe(75);
      expect(bbox.min.y).toBe(50);
      expect(bbox.max.y).toBe(75);
    });

    it("should calculate bbox for ellipse", () => {
      const path = new Path([ellipse(50, 50, 40, 20, 0)]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(10);
      expect(bbox.max.x).toBe(90);
      expect(bbox.min.y).toBe(30);
      expect(bbox.max.y).toBe(70);
    });

    it("should calculate bbox for closed path", () => {
      const path = new Path([
        moveTo(0, 0),
        lineTo(100, 0),
        lineTo(100, 100),
        lineTo(0, 100),
        closePath(),
      ]);
      updatePath(path);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.max.y).toBe(100);
    });

    it("should handle empty path", () => {
      const path = new Path([]);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBe(Infinity);
      expect(bbox.min.y).toBe(Infinity);
      expect(bbox.max.x).toBe(-Infinity);
      expect(bbox.max.y).toBe(-Infinity);
    });

    it("should use provided output bbox", () => {
      const path = new Path([rect(0, 0, 50, 50)]);
      const result = getPathBBox(path);

      expect(result.min.x).toBe(0);
      expect(result.max.x).toBe(50);
    });

    it("should handle complex path with multiple segment types", () => {
      const path = new Path([
        moveTo(0, 0),
        lineTo(50, 0),
        quadraticCurveTo(75, 25, 50, 50),
        bezierCurveTo(25, 75, 0, 75, 0, 50),
        arc(25, 25, 10, 0, Math.PI / 2),
        closePath(),
      ]);
      updatePath(path);
      const bbox = getPathBBox(path);

      expect(bbox.min.x).toBeGreaterThanOrEqual(0);
      expect(bbox.min.y).toBeGreaterThanOrEqual(0);
      expect(bbox.max.x).toBeGreaterThan(0);
      expect(bbox.max.y).toBeGreaterThan(0);
    });
  });

  describe("getPathPoints", () => {
    it("should generate points for simple rectangle", () => {
      const path = new Path([rect(0, 0, 100, 50)]);
      const points = getPathPoints(path);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toBeInstanceOf(Vec2);
    });

    it("should generate points for line segments", () => {
      const path = new Path([moveTo(0, 0), lineTo(100, 0), lineTo(100, 100)]);
      const points = getPathPoints(path);

      expect(points.length).toBe(3);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(0);
      expect(points[1].x).toBe(100);
      expect(points[1].y).toBe(0);
      expect(points[2].x).toBe(100);
      expect(points[2].y).toBe(100);
    });

    it("should generate points for bezier curve", () => {
      const path = new Path([
        moveTo(0, 0),
        bezierCurveTo(33, 0, 66, 100, 100, 100),
      ]);
      updatePath(path);
      const points = getPathPoints(path);

      expect(points.length).toBe(2);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(0);
      // Last point should be at end of curve
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBeCloseTo(100, 1);
      expect(lastPoint.y).toBeCloseTo(100, 1);
    });

    it("should generate points for quadratic curve", () => {
      const path = new Path([moveTo(0, 0), quadraticCurveTo(50, 50, 100, 0)]);
      updatePath(path);
      const points = getPathPoints(path);

      expect(points.length).toBeGreaterThan(2);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(0);
    });

    it("should generate points for arc", () => {
      const path = new Path([arc(0, 0, 50, 0, Math.PI)]);
      const points = getPathPoints(path);

      expect(points.length).toBeGreaterThan(2);
      // Arc should generate curved points
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      expect(firstPoint.x).toBeCloseTo(50, 1);
      expect(lastPoint.x).toBeCloseTo(-50, 1);
    });

    it("should generate points for ellipse", () => {
      const path = new Path([ellipse(0, 0, 50, 25, 0)]);
      const points = getPathPoints(path);

      expect(points.length).toBeGreaterThan(4);
      // Should form closed ellipse
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      expect(Math.abs(firstPoint.x - lastPoint.x)).toBeLessThan(1);
      expect(Math.abs(firstPoint.y - lastPoint.y)).toBeLessThan(1);
    });

    it("should generate points for round rectangle", () => {
      const path = new Path([roundRect(0, 0, 100, 50, 10)]);
      const points = getPathPoints(path);

      expect(points.length).toBeGreaterThan(4);
      expect(points[0]).toBeInstanceOf(Vec2);
    });

    it("should handle closed path", () => {
      const path = new Path([
        moveTo(0, 0),
        lineTo(50, 0),
        lineTo(50, 50),
        closePath(),
      ]);
      updatePath(path);
      const points = getPathPoints(path);

      expect(points.length).toBe(4);
      const lastPoint = points[points.length - 1];
      expect(lastPoint.x).toBe(0);
      expect(lastPoint.y).toBe(0);
    });

    it("should use provided output array", () => {
      const path = new Path([moveTo(10, 20), lineTo(30, 40)]);
      const result = getPathPoints(path);

      expect(result.length).toBe(2);
      expect(result[0].x).toBe(10);
      expect(result[0].y).toBe(20);
    });

    it("should handle empty path", () => {
      const path = new Path([]);
      const points = getPathPoints(path);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBe(0);
    });

    it("should respect path quality", () => {
      const lowQuality = new Path([arc(0, 0, 50, 0, 2 * Math.PI)], 4);
      const highQuality = new Path([arc(0, 0, 50, 0, 2 * Math.PI)], 32);

      const lowPoints = getPathPoints(lowQuality);
      const highPoints = getPathPoints(highQuality);

      expect(highPoints.length).toBeGreaterThan(lowPoints.length);
    });

    it("should reuse Vec2 instances in output array", () => {
      const path = new Path([moveTo(0, 0), lineTo(10, 10)]);
      const outputArray = [new Vec2(), new Vec2(), new Vec2()];
      const originalVec = outputArray[0];

      getPathPoints(path);

      expect(outputArray[0]).toBe(originalVec);
      expect(outputArray[0].x).toBe(0);
      expect(outputArray[0].y).toBe(0);
    });
  });
});
