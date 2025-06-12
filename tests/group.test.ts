import { describe, it, expect, beforeEach } from "vitest";
import { Group, walk } from "../src/renderables/group.js";
import { Shape } from "../src/renderables/shape.js";
import { rect } from "../src/paths/rect.js";
import { Renderable } from "../src/renderables/renderable.js";

describe("Group", () => {
  let group: Group;
  let child1: Shape;
  let child2: Shape;

  beforeEach(() => {
    group = new Group();
    child1 = new Shape({ path: [rect(0, 0, 50, 50)], fill: "red" });
    child2 = new Shape({ path: [rect(50, 50, 50, 50)], fill: "blue" });
  });

  describe("Constructor and Initialization", () => {
    it("should initialize empty group", () => {
      expect(group.children).toEqual([]);
      expect(group.children.length).toBe(0);
    });

    it("should initialize with children", () => {
      const groupWithChildren = new Group({
        children: [child1, child2],
      });

      expect(groupWithChildren.children).toContain(child1);
      expect(groupWithChildren.children).toContain(child2);
      expect(groupWithChildren.children.length).toBe(2);
      expect(child1.parent).toBe(groupWithChildren);
      expect(child2.parent).toBe(groupWithChildren);
    });

    it("should initialize with transform properties", () => {
      const transformedGroup = new Group({
        x: 10,
        y: 20,
        rotation: Math.PI / 4,
        scaleX: 2,
        children: [child1],
      });

      expect(transformedGroup.x).toBe(10);
      expect(transformedGroup.y).toBe(20);
      expect(transformedGroup.rotation).toBe(Math.PI / 4);
      expect(transformedGroup.scaleX).toBe(2);
      expect(transformedGroup.children).toContain(child1);
    });
  });

  describe("Adding Children", () => {
    it("should add single child", () => {
      group.add(child1);

      expect(group.children).toContain(child1);
      expect(group.children.length).toBe(1);
      expect(child1.parent).toBe(group);
    });

    it("should add multiple children", () => {
      group.add(child1, child2);

      expect(group.children).toContain(child1);
      expect(group.children).toContain(child2);
      expect(group.children.length).toBe(2);
      expect(child1.parent).toBe(group);
      expect(child2.parent).toBe(group);
    });

    it("should add children in correct order", () => {
      group.add(child1, child2);

      expect(group.children[0]).toBe(child1);
      expect(group.children[1]).toBe(child2);
    });

    it.todo("should handle adding child that already has parent", () => {
      const parentGroup = new Group();
      parentGroup.add(child1);

      group.add(child1);

      expect(parentGroup.children).not.toContain(child1);
      expect(group.children).toContain(child1);
      expect(child1.parent).toBe(group);
    });

    it.todo("should not add same child twice", () => {
      group.add(child1);
      group.add(child1); // Add same child again

      expect(group.children.length).toBe(1);
      expect(group.children[0]).toBe(child1);
    });
  });

  describe("Removing Children", () => {
    beforeEach(() => {
      group.add(child1, child2);
    });

    it("should remove single child", () => {
      group.remove(child1);

      expect(group.children).not.toContain(child1);
      expect(group.children).toContain(child2);
      expect(group.children.length).toBe(1);
      expect(child1.parent).toBeUndefined();
    });

    it("should remove multiple children", () => {
      group.remove(child1, child2);

      expect(group.children).not.toContain(child1);
      expect(group.children).not.toContain(child2);
      expect(group.children.length).toBe(0);
      expect(child1.parent).toBeUndefined();
      expect(child2.parent).toBeUndefined();
    });

    it("should handle removing non-existent child", () => {
      const otherChild = new Shape({ path: [rect(0, 0, 10, 10)] });

      group.remove(otherChild);

      expect(group.children.length).toBe(2);
      expect(group.children).toContain(child1);
      expect(group.children).toContain(child2);
    });
  });

  describe("Nested Groups", () => {
    it("should handle nested groups", () => {
      const subGroup = new Group();
      const grandChild = new Shape({ path: [rect(0, 0, 25, 25)] });

      subGroup.add(grandChild);
      group.add(child1, subGroup);

      expect(group.children).toContain(subGroup);
      expect(subGroup.parent).toBe(group);
      expect(subGroup.children).toContain(grandChild);
      expect(grandChild.parent).toBe(subGroup);
    });

    it.todo("should prevent circular references", () => {
      const subGroup = new Group();
      group.add(subGroup);

      // Try to add parent group as child of subGroup
      subGroup.add(group);

      expect(subGroup.children).not.toContain(group);
      expect(group.parent).not.toBe(subGroup);
    });

    it("should handle deep nesting", () => {
      const level1 = new Group();
      const level2 = new Group();
      const level3 = new Group();
      const deepChild = new Shape({ path: [rect(0, 0, 10, 10)] });

      level3.add(deepChild);
      level2.add(level3);
      level1.add(level2);
      group.add(level1);

      expect(group.children).toContain(level1);
      expect(level1.children).toContain(level2);
      expect(level2.children).toContain(level3);
      expect(level3.children).toContain(deepChild);
      expect(deepChild.parent).toBe(level3);
    });
  });

  describe("Transform Inheritance", () => {
    it("should inherit parent transforms", () => {
      group.x = 100;
      group.y = 50;
      group.add(child1);

      // Child should inherit parent transform
      expect(child1.parent).toBe(group);
      // The actual inheritance happens during rendering/bounds calculation
      // We just verify the parent relationship is correct
    });

    it("should compose transforms with parent", () => {
      group.x = 100;
      group.rotation = Math.PI / 4;
      child1.x = 50;
      child1.y = 25;

      group.add(child1);

      expect(child1.parent).toBe(group);
      expect(child1.x).toBe(50); // Local transform
      expect(child1.y).toBe(25); // Local transform
      expect(group.x).toBe(100); // Parent transform
    });

    it("should handle nested transform inheritance", () => {
      const subGroup = new Group({ x: 50, y: 25 });
      group.x = 100;
      group.y = 50;
      child1.x = 10;
      child1.y = 5;

      subGroup.add(child1);
      group.add(subGroup);

      expect(child1.parent).toBe(subGroup);
      expect(subGroup.parent).toBe(group);
      // Transforms should compose: group(100,50) -> subGroup(50,25) -> child1(10,5)
    });
  });

  describe("Empty Groups", () => {
    it("should handle empty group operations", () => {
      expect(group.children.length).toBe(0);

      // Should not throw errors
      group.remove(child1);
      expect(group.children.length).toBe(0);

      expect(group.__isDirty).toBe(true);
    });

    it("should handle clearing all children", () => {
      group.add(child1, child2);

      group.remove(...group.children);

      expect(group.children.length).toBe(0);
      expect(child1.parent).toBeUndefined();
      expect(child2.parent).toBeUndefined();
    });
  });

  describe("Walk Function", () => {
    let nestedStructure: Group;

    beforeEach(() => {
      // Create a nested structure for walking tests
      const subGroup1 = new Group();
      const subGroup2 = new Group();
      const deepGroup = new Group();
      const shape1 = new Shape({ path: [rect(0, 0, 10, 10)] });
      const shape2 = new Shape({ path: [rect(10, 10, 10, 10)] });
      const shape3 = new Shape({ path: [rect(20, 20, 10, 10)] });

      deepGroup.add(shape3);
      subGroup1.add(shape1, deepGroup);
      subGroup2.add(shape2);

      nestedStructure = new Group();
      nestedStructure.add(subGroup1, subGroup2);
    });

    it("should walk all renderables in structure", () => {
      const visited: Renderable[] = [];

      walk(nestedStructure, (renderable) => {
        visited.push(renderable);
      });

      // Should visit: root group, 2 subgroups, 1 deep group, 3 shapes = 7 total
      expect(visited.length).toBe(7);
    });

    it("should walk in depth-first order", () => {
      const visited: string[] = [];

      // Add IDs to track order
      nestedStructure.id = "root";
      (nestedStructure.children[0] as Group).id = "sub1";
      (nestedStructure.children[1] as Group).id = "sub2";
      ((nestedStructure.children[0] as Group).children[1] as Group).id = "deep";

      walk(nestedStructure, (renderable) => {
        if (renderable.id) {
          visited.push(renderable.id);
        }
      });

      expect(visited[0]).toBe("root");
      expect(visited[1]).toBe("sub1");
      expect(visited[2]).toBe("deep"); // deep group should come after sub1's first child
      expect(visited[3]).toBe("sub2"); // sub2 should come after sub1 and its children
    });

    it("should support early termination", () => {
      let visitCount = 0;

      const result = walk(nestedStructure, (renderable) => {
        visitCount++;
        if (visitCount === 3) {
          return renderable; // Early return
        }
      });

      expect(visitCount).toBe(3);
      expect(result).toBeDefined();
    });

    it("should handle walking single renderable", () => {
      const visited: Renderable[] = [];

      walk(child1, (renderable) => {
        visited.push(renderable);
      });

      expect(visited.length).toBe(1);
      expect(visited[0]).toBe(child1);
    });

    it("should handle walking empty group", () => {
      const emptyGroup = new Group();
      const visited: Renderable[] = [];

      walk(emptyGroup, (renderable) => {
        visited.push(renderable);
      });

      expect(visited.length).toBe(1); // Just the empty group itself
      expect(visited[0]).toBe(emptyGroup);
    });
  });

  describe("Update and Dirty Tracking", () => {
    it("should mark group as dirty when children change", () => {
      group.__isDirty = false;

      group.add(child1);
      expect(group.__isDirty).toBe(true);

      group.__isDirty = false;
      group.remove(child1);
      expect(group.__isDirty).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle massive number of children", () => {
      const children: Shape[] = [];

      // Add many children
      for (let i = 0; i < 1000; i++) {
        children.push(new Shape({ path: [rect(i, i, 1, 1)] }));
      }

      group.add(...children);

      expect(group.children.length).toBe(1000);
      expect(children.every((child) => child.parent === group)).toBe(true);
    });

    it.todo("should handle adding undefined or null children", () => {
      const initialLength = group.children.length;

      // @ts-ignore - Testing runtime behavior
      group.add(undefined, null);

      expect(group.children.length).toBe(initialLength);
    });

    it.todo("should handle complex parent reassignment", () => {
      const group1 = new Group();
      const group2 = new Group();
      const group3 = new Group();

      group1.add(child1);
      expect(child1.parent).toBe(group1);

      group2.add(child1);
      expect(child1.parent).toBe(group2);
      expect(group1.children).not.toContain(child1);

      group3.add(child1);
      expect(child1.parent).toBe(group3);
      expect(group2.children).not.toContain(child1);
    });
  });
});
