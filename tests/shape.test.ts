import { describe, it, expect, beforeEach } from "vitest";
import { Shape } from "../src/renderables/shape.js";
import {
  rect,
  moveTo,
  lineTo,
  bezierCurveTo,
  quadraticCurveTo,
  arc,
  ellipse,
  closePath,
  linearGradient,
  radialGradient,
} from "../src/index.js";

describe("Shape", () => {
  let shape: Shape;

  beforeEach(() => {
    shape = new Shape({
      path: [rect(0, 0, 100, 50)],
    });
  });

  describe("Constructor and Initialization", () => {
    it("should initialize with basic path", () => {
      expect(shape.path).toBeDefined();
      expect(shape.path.length).toBeGreaterThan(0);
      expect(shape.fill).toBeUndefined();
      expect(shape.stroke).toBeUndefined();
      expect(shape.lineWidth).toBeUndefined();
    });

    it("should initialize with styling properties", () => {
      const styledShape = new Shape({
        path: [rect(0, 0, 100, 50)],
        fill: "red",
        stroke: "blue",
        lineWidth: 5,
        lineCap: "round",
        lineJoin: "round",
        globalAlpha: 0.8,
      });

      expect(styledShape.fill).toBe("red");
      expect(styledShape.stroke).toBe("blue");
      expect(styledShape.lineWidth).toBe(5);
      expect(styledShape.lineCap).toBe("round");
      expect(styledShape.lineJoin).toBe("round");
      expect(styledShape.globalAlpha).toBe(0.8);
    });

    it("should initialize with shadow properties", () => {
      const shadowShape = new Shape({
        path: [rect(0, 0, 100, 50)],
        shadowBlur: 10,
        shadowOffsetX: 5,
        shadowOffsetY: 3,
        shadowColor: "#000",
      });

      expect(shadowShape.shadowBlur).toBe(10);
      expect(shadowShape.shadowOffsetX).toBe(5);
      expect(shadowShape.shadowOffsetY).toBe(3);
      expect(shadowShape.shadowColor).toBe("#000");
    });
  });

  describe("Path Types", () => {
    it("should handle rectangle path", () => {
      const rectShape = new Shape({
        path: [rect(10, 20, 100, 50)],
      });

      expect(rectShape.path.length).toBe(1);
    });

    it("should handle complex path with multiple segments", () => {
      const complexShape = new Shape({
        path: [
          moveTo(0, 0),
          lineTo(100, 0),
          lineTo(100, 100),
          lineTo(0, 100),
          closePath(),
        ],
      });

      expect(complexShape.path.length).toBe(5);
    });

    it("should handle bezier curve path", () => {
      const bezierShape = new Shape({
        path: [moveTo(0, 0), bezierCurveTo(50, -50, 50, 50, 100, 0)],
      });

      expect(bezierShape.path.length).toBe(2);
    });

    it("should handle quadratic curve path", () => {
      const quadShape = new Shape({
        path: [moveTo(0, 0), quadraticCurveTo(50, -50, 100, 0)],
      });

      expect(quadShape.path.length).toBe(2);
    });

    it("should handle arc path", () => {
      const arcShape = new Shape({
        path: [moveTo(0, 0), arc(0, 0, 50, 0, Math.PI)],
      });

      expect(arcShape.path.length).toBe(2);
    });

    it("should handle ellipse path", () => {
      const ellipseShape = new Shape({
        path: [ellipse(0, 0, 100, 50, Math.PI / 4)],
      });

      expect(ellipseShape.path.length).toBe(1);
    });

    it("should handle empty path", () => {
      const emptyShape = new Shape({
        path: [],
      });

      expect(emptyShape.path.length).toBe(0);
    });
  });

  describe("Fill Styles", () => {
    it("should handle solid color fill", () => {
      shape.fill = "red";
      expect(shape.fill).toBe("red");

      shape.fill = "#ff0000";
      expect(shape.fill).toBe("#ff0000");

      shape.fill = "rgb(255, 0, 0)";
      expect(shape.fill).toBe("rgb(255, 0, 0)");

      shape.fill = "rgba(255, 0, 0, 0.5)";
      expect(shape.fill).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should handle linear gradient fill", () => {
      const gradient = linearGradient(0, 0, 100, 100, {
        0: "red",
        50: "green",
        100: "blue",
      });

      shape.fill = gradient;
      expect(shape.fill).toBe(gradient);
    });

    it("should handle radial gradient fill", () => {
      const gradient = radialGradient(50, 50, 0, 50, 50, 50, {
        0: "red",
        100: "blue",
      });

      shape.fill = gradient;
      expect(shape.fill).toBe(gradient);
    });

    it("should handle undefined fill", () => {
      shape.fill = undefined;
      expect(shape.fill).toBeUndefined();
    });
  });

  describe("Stroke Styles", () => {
    it("should handle stroke color", () => {
      shape.stroke = "blue";
      expect(shape.stroke).toBe("blue");
    });

    it("should handle stroke width", () => {
      shape.lineWidth = 10;
      expect(shape.lineWidth).toBe(10);

      shape.lineWidth = 0;
      expect(shape.lineWidth).toBe(0);

      shape.lineWidth = 0.5;
      expect(shape.lineWidth).toBe(0.5);
    });

    it("should handle line cap styles", () => {
      shape.lineCap = "round";
      expect(shape.lineCap).toBe("round");

      shape.lineCap = "square";
      expect(shape.lineCap).toBe("square");

      shape.lineCap = "butt";
      expect(shape.lineCap).toBe("butt");
    });

    it("should handle line join styles", () => {
      shape.lineJoin = "round";
      expect(shape.lineJoin).toBe("round");

      shape.lineJoin = "bevel";
      expect(shape.lineJoin).toBe("bevel");

      shape.lineJoin = "miter";
      expect(shape.lineJoin).toBe("miter");
    });

    it("should handle miter limit", () => {
      shape.miterLimit = 5;
      expect(shape.miterLimit).toBe(5);
    });

    it("should handle line dash", () => {
      shape.lineDash = [5, 10];
      expect(shape.lineDash).toEqual([5, 10]);

      shape.lineDash = [2, 4, 6];
      expect(shape.lineDash).toEqual([2, 4, 6]);
    });

    it("should handle line dash offset", () => {
      shape.lineDashOffset = 5;
      expect(shape.lineDashOffset).toBe(5);
    });
  });

  describe("Advanced Styling", () => {
    it("should handle global alpha", () => {
      shape.globalAlpha = 0.5;
      expect(shape.globalAlpha).toBe(0.5);

      shape.globalAlpha = 0;
      expect(shape.globalAlpha).toBe(0);

      shape.globalAlpha = 1;
      expect(shape.globalAlpha).toBe(1);
    });

    it("should handle shadow properties", () => {
      shape.shadowBlur = 10;
      shape.shadowOffsetX = 5;
      shape.shadowOffsetY = 3;
      shape.shadowColor = "rgba(0, 0, 0, 0.5)";

      expect(shape.shadowBlur).toBe(10);
      expect(shape.shadowOffsetX).toBe(5);
      expect(shape.shadowOffsetY).toBe(3);
      expect(shape.shadowColor).toBe("rgba(0, 0, 0, 0.5)");
    });

    it("should handle filter property", () => {
      shape.filter = "blur(5px)";
      expect(shape.filter).toBe("blur(5px)");

      shape.filter = "brightness(0.5) contrast(1.2)";
      expect(shape.filter).toBe("brightness(0.5) contrast(1.2)");
    });
  });

  describe("Path Quality", () => {
    it("should have default quality", () => {
      expect(shape.path.quality).toBeDefined();
      expect(shape.path.quality).toBeGreaterThan(0);
    });

    it("should accept custom quality", () => {
      const highQualityShape = new Shape({
        path: [arc(0, 0, 50, 0, Math.PI)],
        quality: 50,
      });

      expect(highQualityShape.path.quality).toBe(50);
    });

    it("should affect curve sampling quality", () => {
      const lowQuality = new Shape({
        path: [arc(0, 0, 50, 0, 2 * Math.PI)],
        quality: 4,
      });

      const highQuality = new Shape({
        path: [arc(0, 0, 50, 0, 2 * Math.PI)],
        quality: 100,
      });

      // High quality should generate more points for smooth curves
      // This is a basic check - actual point count depends on implementation
      expect(highQuality.path.quality).toBeGreaterThan(lowQuality.path.quality);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero-size rectangle", () => {
      const zeroShape = new Shape({
        path: [rect(0, 0, 0, 0)],
      });

      expect(zeroShape.path).toBeDefined();
      expect(zeroShape.path.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle negative dimensions", () => {
      const negativeShape = new Shape({
        path: [rect(0, 0, -100, -50)],
      });

      expect(negativeShape.path).toBeDefined();
    });

    it("should handle very large dimensions", () => {
      const largeShape = new Shape({
        path: [rect(0, 0, 1000000, 1000000)],
      });

      expect(largeShape.path).toBeDefined();
    });

    it("should handle extreme line width", () => {
      shape.lineWidth = 0;
      expect(shape.lineWidth).toBe(0);

      shape.lineWidth = 1000;
      expect(shape.lineWidth).toBe(1000);
    });

    it("should handle invalid alpha values", () => {
      shape.globalAlpha = -1;
      expect(shape.globalAlpha).toBe(-1); // Should accept any number

      shape.globalAlpha = 2;
      expect(shape.globalAlpha).toBe(2);
    });

    it("should handle extreme shadow values", () => {
      shape.shadowBlur = -10;
      expect(shape.shadowBlur).toBe(-10);

      shape.shadowOffsetX = 1000;
      shape.shadowOffsetY = -1000;
      expect(shape.shadowOffsetX).toBe(1000);
      expect(shape.shadowOffsetY).toBe(-1000);
    });
  });

  describe("Transform Integration", () => {
    it("should maintain path when transformed", () => {
      const originalLength = shape.path.length;

      shape.x = 100;
      shape.y = 50;
      shape.rotation = Math.PI / 4;
      shape.scaleX = 2;

      expect(shape.path.length).toBe(originalLength);
    });

    it("should update when transform changes", () => {
      const initialVersion = shape.__version;

      shape.x = 10;
      expect(shape.__version).toBeGreaterThan(initialVersion);
    });
  });

  describe("Complex Path Scenarios", () => {
    it("should handle path with all segment types", () => {
      const complexShape = new Shape({
        path: [
          moveTo(0, 0),
          lineTo(100, 0),
          quadraticCurveTo(150, 50, 100, 100),
          bezierCurveTo(50, 150, 0, 150, 0, 100),
          arc(50, 50, 25, 0, Math.PI),
          ellipse(75, 25, 20, 10, Math.PI / 6),
          closePath(),
        ],
      });

      expect(complexShape.path.length).toBe(7);
    });

    it("should handle multiple disconnected paths", () => {
      const multiShape = new Shape({
        path: [
          // First shape
          moveTo(0, 0),
          lineTo(50, 0),
          lineTo(50, 50),
          lineTo(0, 50),
          closePath(),

          // Second shape
          moveTo(100, 100),
          lineTo(150, 100),
          lineTo(150, 150),
          lineTo(100, 150),
          closePath(),
        ],
      });

      expect(multiShape.path.length).toBe(10);
    });
  });
});
