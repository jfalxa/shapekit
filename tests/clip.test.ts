import { describe, it, expect, beforeEach } from "vitest";
import { Clip } from "../src/renderables/clip.js";
import {
  rect,
  ellipse,
  moveTo,
  lineTo,
  closePath,
  quadraticCurveTo,
  Path,
} from "../src/index.js";

describe("Clip", () => {
  let clip: Clip;
  let path: any[];

  beforeEach(() => {
    path = [rect(0, 0, 100, 50)];

    clip = new Clip({
      path: path,
    });
  });

  describe("Constructor and Initialization", () => {
    it("should initialize with path", () => {
      expect(Array.isArray(clip.path)).toBe(true);
      expect(clip.path.length).toBe(1);
      expect(clip.fillRule).toBeUndefined();
    });

    it("should initialize with fillRule", () => {
      const clipWithFillRule = new Clip({
        path: path,
        fillRule: "evenodd",
      });

      expect(Array.isArray(clipWithFillRule.path)).toBe(true);
      expect(clipWithFillRule.fillRule).toBe("evenodd");
    });

    it("should initialize with transform properties", () => {
      const transformedClip = new Clip({
        path: path,
        x: 50,
        y: 25,
        rotation: Math.PI / 4,
        scaleX: 2,
      });

      expect(transformedClip.x).toBe(50);
      expect(transformedClip.y).toBe(25);
      expect(transformedClip.rotation).toBe(Math.PI / 4);
      expect(transformedClip.scaleX).toBe(2);
    });
  });

  describe("Path Property", () => {
    it("should handle different path types", () => {
      const rectPath = new Path([rect(10, 10, 80, 40)]);
      const circlePath = new Path([ellipse(50, 25, 20, 20)]);

      clip.path = rectPath;
      expect(Array.isArray(clip.path)).toBe(true);

      clip.path = circlePath;
      expect(Array.isArray(clip.path)).toBe(true);
    });

    it("should handle complex paths", () => {
      const complexPath = new Path([
        moveTo(0, 0),
        lineTo(100, 0),
        lineTo(100, 50),
        lineTo(0, 50),
        closePath(),
      ]);

      clip.path = complexPath;
      expect(Array.isArray(clip.path)).toBe(true);
    });

    it("should handle path with curves", () => {
      const curvePath = new Path([
        moveTo(0, 25),
        quadraticCurveTo(50, 0, 100, 25),
        quadraticCurveTo(50, 50, 0, 25),
      ]);

      clip.path = curvePath;
      expect(Array.isArray(clip.path)).toBe(true);
    });
  });

  describe("Fill Rule", () => {
    it("should handle nonzero fill rule", () => {
      clip.fillRule = "nonzero";
      expect(clip.fillRule).toBe("nonzero");
    });

    it("should handle evenodd fill rule", () => {
      clip.fillRule = "evenodd";
      expect(clip.fillRule).toBe("evenodd");
    });

    it("should handle undefined fill rule", () => {
      clip.fillRule = undefined;
      expect(clip.fillRule).toBeUndefined();
    });
  });

  describe("Inheritance from Shape", () => {
    it("should inherit all Shape properties", () => {
      expect(clip.path).toBeDefined();
      expect(clip.x).toBeDefined();
      expect(clip.y).toBeDefined();
      expect(clip.scaleX).toBeDefined();
      expect(clip.scaleY).toBeDefined();
    });

    it("should inherit Shape methods", () => {
      expect(typeof clip.update).toBe("function");
    });

    it("should handle styling properties inherited from Shape", () => {
      clip.fill = "red";
      clip.stroke = "blue";
      clip.lineWidth = 2;

      expect(clip.fill).toBe("red");
      expect(clip.stroke).toBe("blue");
      expect(clip.lineWidth).toBe(2);
    });
  });

  describe("Transform Integration", () => {
    it("should maintain clip properties when transformed", () => {
      const originalPath = clip.path;
      const originalFillRule = clip.fillRule;

      clip.x = 100;
      clip.y = 50;
      clip.rotation = Math.PI / 2;
      clip.scaleX = 1.5;

      expect(clip.path).toBe(originalPath);
      expect(clip.fillRule).toBe(originalFillRule);
    });

    it("should update when transform changes", () => {
      const initialVersion = clip.__version;

      clip.x = 10;
      expect(clip.__version).toBeGreaterThan(initialVersion);
    });

    it("should handle scaling with clipping paths", () => {
      clip.scaleX = 2;
      clip.scaleY = 0.5;

      expect(clip.scaleX).toBe(2);
      expect(clip.scaleY).toBe(0.5);
      // Path should remain unchanged
      expect(Array.isArray(clip.path)).toBe(true);
    });
  });

  describe("Clipping Scenarios", () => {
    it("should handle rectangular clipping", () => {
      const rectClip = new Clip({
        path: path,
        fillRule: "nonzero",
      });

      expect(Array.isArray(rectClip.path)).toBe(true);
      expect(rectClip.fillRule).toBe("nonzero");
    });

    it("should handle circular clipping", () => {
      const circlePath = [ellipse(50, 25, 20, 20)];

      const circleClip = new Clip({
        path: circlePath,
        fillRule: "evenodd",
      });

      expect(Array.isArray(circleClip.path)).toBe(true);
      expect(circleClip.fillRule).toBe("evenodd");
    });

    it("should handle complex polygon clipping", () => {
      const polygonPath = [
        moveTo(50, 0),
        lineTo(100, 25),
        lineTo(75, 50),
        lineTo(25, 50),
        lineTo(0, 25),
        closePath(),
      ];

      const polygonClip = new Clip({
        path: polygonPath,
      });

      expect(Array.isArray(polygonClip.path)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty path", () => {
      const emptyPath: any[] = [];

      const emptyClip = new Clip({
        path: emptyPath,
      });

      expect(Array.isArray(emptyClip.path)).toBe(true);
    });

    it("should handle very large clipping areas", () => {
      const largePath = [rect(-1000, -1000, 2000, 2000)];

      const largeClip = new Clip({
        path: largePath,
      });

      expect(Array.isArray(largeClip.path)).toBe(true);
    });

    it("should handle very small clipping areas", () => {
      const tinyPath = [rect(0, 0, 0.1, 0.1)];

      const tinyClip = new Clip({
        path: tinyPath,
      });

      expect(Array.isArray(tinyClip.path)).toBe(true);
    });

    it("should handle path with self-intersections", () => {
      const selfIntersectingPath = [
        moveTo(0, 0),
        lineTo(100, 50),
        lineTo(0, 50),
        lineTo(100, 0),
        closePath(),
      ];

      const selfIntersectingClip = new Clip({
        path: selfIntersectingPath,
        fillRule: "evenodd",
      });

      expect(Array.isArray(selfIntersectingClip.path)).toBe(true);
      expect(selfIntersectingClip.fillRule).toBe("evenodd");
    });

    it("should handle extreme transformations", () => {
      clip.scaleX = 0.001;
      clip.scaleY = 1000;
      clip.rotation = 10 * Math.PI;
      clip.skewX = Math.PI / 2;

      expect(clip.scaleX).toBe(0.001);
      expect(clip.scaleY).toBe(1000);
      expect(clip.rotation).toBe(10 * Math.PI);
      expect(clip.skewX).toBe(Math.PI / 2);
    });
  });

  describe("Quality and Performance", () => {
    it("should handle many path operations", () => {
      const complexPath = new Path([moveTo(0, 0)]);

      for (let i = 1; i < 100; i++) {
        complexPath.push(lineTo(i, Math.sin(i * 0.1) * 10));
      }

      clip.path = complexPath;
      expect(Array.isArray(clip.path)).toBe(true);
    });
  });

  describe("Integration with Other Renderables", () => {
    it("should work as a clipping mask", () => {
      // Test that clip maintains its properties when used as mask
      const maskClip = new Clip({
        path: path,
        fillRule: "evenodd",
        x: 10,
        y: 10,
        scaleX: 1.2,
      });

      expect(Array.isArray(maskClip.path)).toBe(true);
      expect(maskClip.fillRule).toBe("evenodd");
      expect(maskClip.x).toBe(10);
      expect(maskClip.y).toBe(10);
      expect(maskClip.scaleX).toBe(1.2);
    });

    it("should handle nested clipping scenarios", () => {
      const outerPath = [rect(0, 0, 200, 100)];
      const innerPath = [rect(50, 25, 100, 50)];

      const outerClip = new Clip({ path: outerPath });
      const innerClip = new Clip({ path: innerPath });

      expect(Array.isArray(outerClip.path)).toBe(true);
      expect(Array.isArray(innerClip.path)).toBe(true);
    });
  });
});
