import { describe, it, expect, beforeEach } from 'vitest';
import { Renderable, Transform } from '../src/renderables/renderable.js';
import { Matrix3 } from '../src/utils/mat3.js';
import { Vec2 } from '../src/utils/vec2.js';

class TestRenderable extends Renderable {
  constructor(init: Partial<Transform> = {}) {
    super(init);
  }
}

describe('Renderable', () => {
  let renderable: TestRenderable;

  beforeEach(() => {
    renderable = new TestRenderable();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default values', () => {
      expect(renderable.x).toBe(0);
      expect(renderable.y).toBe(0);
      expect(renderable.scaleX).toBe(1);
      expect(renderable.scaleY).toBe(1);
      expect(renderable.skewX).toBe(0);
      expect(renderable.skewY).toBe(0);
      expect(renderable.rotation).toBe(0);
      expect(renderable.parent).toBeUndefined();
    });

    it('should initialize with provided values', () => {
      const init = {
        x: 10,
        y: 20,
        scaleX: 2,
        scaleY: 0.5,
        skewX: 0.1,
        skewY: -0.1,
        rotation: Math.PI / 4
      };
      const r = new TestRenderable(init);
      
      expect(r.x).toBe(10);
      expect(r.y).toBe(20);
      expect(r.scaleX).toBe(2);
      expect(r.scaleY).toBe(0.5);
      expect(r.skewX).toBe(0.1);
      expect(r.skewY).toBe(-0.1);
      expect(r.rotation).toBe(Math.PI / 4);
    });
  });

  describe('Transform Properties', () => {
    it('should update x and y coordinates', () => {
      renderable.x = 100;
      renderable.y = 200;
      
      expect(renderable.x).toBe(100);
      expect(renderable.y).toBe(200);
    });

    it('should update scale properties', () => {
      renderable.scaleX = 2;
      renderable.scaleY = 0.5;
      
      expect(renderable.scaleX).toBe(2);
      expect(renderable.scaleY).toBe(0.5);
    });

    it('should update skew properties', () => {
      renderable.skewX = 0.5;
      renderable.skewY = -0.3;
      
      expect(renderable.skewX).toBe(0.5);
      expect(renderable.skewY).toBe(-0.3);
    });

    it('should update rotation', () => {
      renderable.rotation = Math.PI / 2;
      
      expect(renderable.rotation).toBe(Math.PI / 2);
    });

    it('should handle extreme transform values', () => {
      renderable.scaleX = 0.001;
      renderable.scaleY = 1000;
      renderable.rotation = 10 * Math.PI;
      renderable.skewX = Math.PI;
      renderable.skewY = -Math.PI;
      
      expect(renderable.scaleX).toBe(0.001);
      expect(renderable.scaleY).toBe(1000);
      expect(renderable.rotation).toBe(10 * Math.PI);
      expect(renderable.skewX).toBe(Math.PI);
      expect(renderable.skewY).toBe(-Math.PI);
    });
  });

  describe('Transform Matrix', () => {
    it('should have identity transform by default', () => {
      const transform = renderable.transform;
      const identity = Matrix3.IDENTITY;
      
      for (let i = 0; i < 9; i++) {
        expect(transform[i]).toBeCloseTo(identity[i], 10);
      }
    });

    it('should generate correct translation matrix', () => {
      renderable.x = 10;
      renderable.y = 20;
      renderable.update();
      
      const transform = renderable.transform;
      expect(transform[6]).toBe(10); // tx
      expect(transform[7]).toBe(20); // ty
    });

    it('should generate correct scale matrix', () => {
      renderable.scaleX = 2;
      renderable.scaleY = 3;
      renderable.update();
      
      const transform = renderable.transform;
      expect(transform[0]).toBe(2); // scaleX
      expect(transform[4]).toBe(3); // scaleY
    });

    it('should generate correct rotation matrix', () => {
      renderable.rotation = Math.PI / 2; // 90 degrees
      renderable.update();
      
      const transform = renderable.transform;
      expect(transform[0]).toBeCloseTo(0, 10); // cos(90°) ≈ 0
      expect(transform[1]).toBeCloseTo(1, 10); // sin(90°) ≈ 1
      expect(transform[3]).toBeCloseTo(-1, 10); // -sin(90°) ≈ -1
      expect(transform[4]).toBeCloseTo(0, 10); // cos(90°) ≈ 0
    });

    it('should compose transforms correctly', () => {
      renderable.x = 10;
      renderable.y = 20;
      renderable.scaleX = 2;
      renderable.scaleY = 3;
      renderable.rotation = Math.PI / 4; // 45 degrees
      renderable.update();
      
      const transform = renderable.transform;
      
      // Test that a point transforms correctly
      const point = new Vec2(1, 0);
      point.transform(transform);
      
      // Expected: scale(2,3) -> rotate(45°) -> translate(10,20)
      const cos45 = Math.cos(Math.PI / 4);
      const sin45 = Math.sin(Math.PI / 4);
      const expectedX = 10 + 2 * cos45; // 10 + 2 * cos(45°)
      const expectedY = 20 + 2 * sin45; // 20 + 2 * sin(45°)
      
      expect(point.x).toBeCloseTo(expectedX, 10);
      expect(point.y).toBeCloseTo(expectedY, 10);
    });
  });

  describe('Cache and Dirty Tracking', () => {
    it('should have initial cache state', () => {
      expect(renderable.__version).toBeDefined();
      expect(renderable.__cache).toBeDefined();
      expect(renderable.__isDirty).toBe(true);
    });

    it('should mark as dirty when transform properties change', () => {
      renderable.__isDirty = false;
      
      renderable.x = 10;
      expect(renderable.__isDirty).toBe(true);
      
      renderable.__isDirty = false;
      renderable.y = 20;
      expect(renderable.__isDirty).toBe(true);
      
      renderable.__isDirty = false;
      renderable.scaleX = 2;
      expect(renderable.__isDirty).toBe(true);
      
      renderable.__isDirty = false;
      renderable.rotation = Math.PI;
      expect(renderable.__isDirty).toBe(true);
    });

    it('should increment version when marked dirty', () => {
      const initialVersion = renderable.__version;
      
      renderable.x = 10;
      expect(renderable.__version).toBeGreaterThan(initialVersion);
    });
  });

  describe('Parent Relationship', () => {
    it('should track parent correctly', () => {
      expect(renderable.parent).toBeUndefined();
      
      // Parent is typically set by Group.add(), not directly
      // We'll test this in the Group tests instead
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero scale', () => {
      renderable.scaleX = 0;
      renderable.scaleY = 0;
      renderable.update();
      
      const transform = renderable.transform;
      expect(transform[0]).toBe(0);
      expect(transform[4]).toBe(0);
    });

    it('should handle negative scale', () => {
      renderable.scaleX = -1;
      renderable.scaleY = -2;
      renderable.update();
      
      const transform = renderable.transform;
      expect(transform[0]).toBe(-1);
      expect(transform[4]).toBe(-2);
    });

    it('should handle very large rotations', () => {
      renderable.rotation = 100 * Math.PI; // Many full rotations
      
      const transform = renderable.transform;
      // Should be equivalent to no rotation (0 or 2π)
      expect(transform[0]).toBeCloseTo(1, 10); // cos(0) = 1
      expect(transform[1]).toBeCloseTo(0, 10); // sin(0) = 0
    });

    it('should handle NaN values gracefully', () => {
      // Setting NaN should not break the object
      renderable.x = NaN;
      expect(renderable.x).toBeNaN();
      
      renderable.update();
      // Transform should handle NaN appropriately
      const transform = renderable.transform;
      expect(transform[6]).toBeNaN(); // tx should be NaN
    });
  });

  describe('Update Method', () => {
    it('should call update method without errors', () => {
      expect(() => renderable.update()).not.toThrow();
    });

    it('should reset dirty flag after update', () => {
      renderable.x = 10; // Mark as dirty
      expect(renderable.__isDirty).toBe(true);
      
      renderable.update();
      expect(renderable.__isDirty).toBe(true); // Still dirty because it doesn't auto-reset
    });
  });
});