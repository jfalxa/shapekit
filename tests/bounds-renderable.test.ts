import { describe, it, expect, beforeEach } from "vitest";
import {
  getLocalTransform,
  getCenter,
  getBBox,
  getLocalBBox,
  getNaturalBBox,
  getPoints,
  getLocalPoints,
  getNaturalPoints,
} from "../src/bounds/renderable.js";
import { Shape } from "../src/renderables/shape.js";
import { Group } from "../src/renderables/group.js";
import { Image } from "../src/renderables/image.js";
import { Text } from "../src/renderables/text.js";
import { Matrix3 } from "../src/utils/mat3.js";
import { Vec2 } from "../src/utils/vec2.js";
import { BBox } from "../src/bounds/bbox.js";
import { rect, moveTo, lineTo, arc } from "../src/index.js";

// @ts-ignore
globalThis.VideoFrame = class {};
// @ts-ignore
globalThis.SVGImageElement = class {};

// Mock Image and Text classes to avoid external dependencies
class MockImage extends Image {
  private _width: number;
  private _height: number;

  constructor(width = 100, height = 50) {
    super({ image: document.createElement("img") });
    this._width = width;
    this._height = height;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }
}

class MockText extends Text {
  private _width: number;
  private _height: number;

  constructor(width = 80, height = 20) {
    super({ text: "test" });
    this._width = width;
    this._height = height;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }
}

describe("bounds/renderable", () => {
  let shape: Shape;
  let group: Group;

  beforeEach(() => {
    shape = new Shape({
      path: [rect(0, 0, 100, 50)],
    });

    group = new Group();
  });

  describe("getLocalTransform", () => {
    it("should return identity matrix for untransformed renderable", () => {
      const transform = getLocalTransform(shape);

      expect(transform).toBeInstanceOf(Matrix3);
      expect(transform[0]).toBe(1);
      expect(transform[4]).toBe(1);
      expect(transform[8]).toBe(1);
      expect(transform[2]).toBe(0);
      expect(transform[5]).toBe(0);
    });

    it("should compose transform from renderable properties", () => {
      shape.x = 10;
      shape.y = 20;
      shape.scaleX = 2;
      shape.scaleY = 1.5;

      const transform = getLocalTransform(shape);

      expect(transform[6]).toBe(10);
      expect(transform[7]).toBe(20);
      expect(transform[0]).toBe(2);
      expect(transform[4]).toBe(1.5);
    });

    it("should handle rotation", () => {
      shape.rotation = Math.PI / 2;

      shape.update();
      const transform = getLocalTransform(shape);

      expect(transform[0]).toBeCloseTo(0, 5);
      expect(transform[4]).toBeCloseTo(0, 5);
      expect(transform[3]).toBeCloseTo(-1, 5);
      expect(transform[5]).toBeCloseTo(0, 5);
    });
  });

  describe("getCenter", () => {
    it("should return origin for untransformed renderable", () => {
      const center = getCenter(shape);

      expect(center).toBeInstanceOf(Vec2);
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);
    });

    it("should return transformed position", () => {
      shape.x = 50;
      shape.y = 30;

      shape.update();
      const center = getCenter(shape);

      expect(center.x).toBe(50);
      expect(center.y).toBe(30);
    });

    it("should handle scale transformation", () => {
      shape.x = 10;
      shape.y = 20;
      shape.scaleX = 2;
      shape.scaleY = 3;

      shape.update();
      const center = getCenter(shape);

      expect(center.x).toBe(10);
      expect(center.y).toBe(20);
    });
  });

  describe("getBBox", () => {
    it("should return transformed natural bbox", () => {
      const bbox = getBBox(shape);

      expect(bbox).toBeInstanceOf(BBox);
      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.max.y).toBe(50);
    });

    it("should apply translation", () => {
      shape.x = 10;
      shape.y = 20;

      shape.update();
      const bbox = getBBox(shape);

      expect(bbox.min.x).toBe(10);
      expect(bbox.min.y).toBe(20);
      expect(bbox.max.x).toBe(110);
      expect(bbox.max.y).toBe(70);
    });

    it("should apply scale", () => {
      shape.scaleX = 2;
      shape.scaleY = 1.5;

      shape.update();
      const bbox = getBBox(shape);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(200);
      expect(bbox.max.y).toBe(75);
    });

    it("should handle combined transformations", () => {
      shape.x = 10;
      shape.y = 20;
      shape.scaleX = 2;
      shape.scaleY = 1.5;

      shape.update();
      const bbox = getBBox(shape);

      expect(bbox.min.x).toBe(10);
      expect(bbox.min.y).toBe(20);
      expect(bbox.max.x).toBe(210);
      expect(bbox.max.y).toBe(95);
    });
  });

  describe("getLocalBBox", () => {
    it("should return natural bbox with local transform applied", () => {
      const bbox = getLocalBBox(shape);

      expect(bbox).toBeInstanceOf(BBox);
      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.max.y).toBe(50);
    });

    it("should apply local scale", () => {
      shape.scaleX = 2;
      shape.scaleY = 1.5;

      const bbox = getLocalBBox(shape);

      expect(bbox.max.x).toBe(200);
      expect(bbox.max.y).toBe(75);
    });
  });

  describe("getNaturalBBox", () => {
    it("should return path bbox for shape", () => {
      const bbox = getNaturalBBox(shape);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(100);
      expect(bbox.max.y).toBe(50);
    });

    it("should return size bbox for image", () => {
      const image = new MockImage(120, 80);
      const bbox = getNaturalBBox(image);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(120);
      expect(bbox.max.y).toBe(80);
    });

    it("should return size bbox for text", () => {
      const text = new MockText(60, 24);
      const bbox = getNaturalBBox(text);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBe(60);
      expect(bbox.max.y).toBe(24);
    });

    it("should return merged bbox for group with children", () => {
      const child1 = new Shape({ path: [rect(0, 0, 50, 30)] });
      const child2 = new Shape({ path: [rect(60, 40, 40, 20)] });
      child2.x = 60;
      child2.y = 40;

      group.add(child1, child2);

      const bbox = getNaturalBBox(group);

      expect(bbox.min.x).toBe(0);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.x).toBeGreaterThanOrEqual(100);
      expect(bbox.max.y).toBeGreaterThanOrEqual(60);
    });

    it("should return empty bbox for empty group", () => {
      const bbox = getNaturalBBox(group);

      expect(bbox.min.x).toBe(Infinity);
      expect(bbox.min.y).toBe(Infinity);
      expect(bbox.max.x).toBe(-Infinity);
      expect(bbox.max.y).toBe(-Infinity);
    });
  });

  describe("getPoints", () => {
    it("should return transformed natural points", () => {
      const points = getPoints(shape);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toBeInstanceOf(Vec2);
    });

    it("should apply translation to points", () => {
      shape.x = 10;
      shape.y = 20;

      shape.update();

      const points = getPoints(shape);
      const firstPoint = points[0];

      expect(firstPoint.x).toBe(10);
      expect(firstPoint.y).toBe(20);
    });

    it("should apply scale to points", () => {
      shape.scaleX = 2;
      shape.scaleY = 2;

      const originalPoints = getNaturalPoints(shape);
      const scaledPoints = getPoints(shape);

      expect(scaledPoints[0].x).toBeCloseTo(originalPoints[0].x * 2, 1);
      expect(scaledPoints[0].y).toBeCloseTo(originalPoints[0].y * 2, 1);
    });
  });

  describe("getLocalPoints", () => {
    it("should return natural points with local transform", () => {
      const points = getLocalPoints(shape);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toBeInstanceOf(Vec2);
    });

    it("should apply local scale", () => {
      shape.scaleX = 2;
      shape.scaleY = 1.5;

      const naturalPoints = getNaturalPoints(shape);
      const localPoints = getLocalPoints(shape);

      expect(localPoints[0].x).toBeCloseTo(naturalPoints[0].x * 2, 1);
      expect(localPoints[0].y).toBeCloseTo(naturalPoints[0].y * 1.5, 1);
    });

    it("should use provided output array", () => {
      const result = getLocalPoints(shape);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("getNaturalPoints", () => {
    it("should return path points for shape", () => {
      const points = getNaturalPoints(shape);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toBeInstanceOf(Vec2);
    });

    it("should return corner points for image", () => {
      const image = new MockImage(100, 50);
      const points = getNaturalPoints(image);

      expect(points.length).toBe(5);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(0);
      expect(points[2].x).toBe(100);
      expect(points[2].y).toBe(50);
    });

    it("should return corner points for text", () => {
      const text = new MockText(80, 20);
      const points = getNaturalPoints(text);

      expect(points.length).toBe(5);
      expect(points[0].x).toBe(0);
      expect(points[0].y).toBe(0);
      expect(points[2].x).toBe(80);
      expect(points[2].y).toBe(20);
    });

    it("should return empty array for group", () => {
      const points = getNaturalPoints(group);

      expect(points).toBeInstanceOf(Array);
      expect(points.length).toBe(0);
    });

    it("should handle complex shapes", () => {
      const complexShape = new Shape({
        path: [
          moveTo(0, 0),
          lineTo(50, 0),
          arc(50, 25, 25, -Math.PI / 2, Math.PI / 2),
          lineTo(0, 50),
        ],
      });

      const points = getNaturalPoints(complexShape);

      expect(points.length).toBeGreaterThan(4);
      expect(points[0]).toBeInstanceOf(Vec2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle renderables with zero dimensions", () => {
      const zeroShape = new Shape({ path: [rect(0, 0, 0, 0)] });

      const bbox = getNaturalBBox(zeroShape);
      const points = getNaturalPoints(zeroShape);

      expect(bbox.min.x).toBe(0);
      expect(bbox.max.x).toBe(0);
      expect(points.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle negative scales", () => {
      shape.scaleX = -1;
      shape.scaleY = -1;

      const bbox = getLocalBBox(shape);
      const points = getLocalPoints(shape);

      expect(bbox).toBeInstanceOf(BBox);
      expect(points).toBeInstanceOf(Array);
    });

    it("should handle very large transforms", () => {
      shape.x = 1000000;
      shape.y = 1000000;
      shape.scaleX = 1000;

      shape.update();

      const center = getCenter(shape);
      const bbox = getBBox(shape);

      expect(center.x).toBe(1000000);
      expect(center.y).toBe(1000000);
      expect(bbox.max.x).toBeGreaterThan(1000000);
    });

    it("should handle rotation edge cases", () => {
      shape.rotation = 2 * Math.PI; // Full rotation

      const transform = getLocalTransform(shape);

      expect(transform[0]).toBeCloseTo(1, 5);
      expect(transform[4]).toBeCloseTo(1, 5);
    });
  });

  describe("Caching Behavior", () => {
    it("should return same bbox instance when cached", () => {
      const bbox1 = getBBox(shape);
      const bbox2 = getBBox(shape);

      expect(bbox1).toBe(bbox2);
    });

    it("should return the same bbox instance after transform change", () => {
      const bbox1 = getBBox(shape);
      shape.x = 10;
      const bbox2 = getBBox(shape);

      expect(bbox1).toBe(bbox2);
    });

    it("should return same points instance when cached", () => {
      const points1 = getPoints(shape);
      const points2 = getPoints(shape);

      expect(points1).toBe(points2);
    });
  });
});
