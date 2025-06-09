# Transforms Module Guide

The transforms module (`shapekit/transforms`) provides the `Transformer` class, a powerful tool for building interactive transformation interfaces. It allows users to manipulate multiple shapes simultaneously with unified controls for translation, rotation, scaling, and more advanced operations.

The API reference can be accessed [here](./api-transforms.md).

## Table of Contents

- [Basic Usage](#basic-usage)
- [Selection Management](#selection-management)
- [Transformation Operations](#transformation-operations)
- [Interactive Manipulation](#interactive-manipulation)
- [Building Transform UIs](#building-transform-uis)
- [Advanced Features](#advanced-features)

## Basic Usage

The `Transformer` class provides a high-level interface for manipulating groups of shapes together.

### Creating a Transformer

```typescript
import { Transformer } from "shapekit/transforms";
import { Shape, rect } from "shapekit";

// Create some shapes
const shape1 = new Shape({
  x: 100,
  y: 100,
  fill: "red",
  path: [rect(0, 0, 50, 50)],
});

const shape2 = new Shape({
  x: 200,
  y: 150,
  fill: "blue",
  path: [rect(0, 0, 60, 40)],
});

// Create transformer
const transformer = new Transformer();

// Select shapes to transform
transformer.select(shape1, shape2);
```

### Basic Transformations

```typescript
// Translate selection
transformer.translate({ x: 50, y: 25 });
transformer.apply(); // Apply changes to shapes

// Modify properties directly
transformer.x = 10;
transformer.y = 20;
transformer.rotation = Math.PI / 4; // 45 degrees
transformer.scaleX = 1.5;
transformer.scaleY = 0.8;
transformer.apply();

// Commit changes (makes them permanent)
transformer.commit();

// Revert to last committed state
transformer.revert();
```

## Selection Management

### Selecting Shapes

```typescript
// Select individual shapes
transformer.select(shape1);

// Select multiple shapes
transformer.select(shape1, shape2, shape3);

// Select from array
const allShapes = [shape1, shape2, shape3];
transformer.select(...allShapes);

// Clear selection
transformer.select();
```

### Selection Behavior

```typescript
// Single shape selection
transformer.select(shape1);
console.log(transformer.selection.length); // 1

// The transformer adapts its behavior:
// - Single shape: transform the shape directly
// - Multiple shapes: transform as a group

// Access current selection
transformer.selection.forEach((shape) => {
  console.log(`Selected: ${shape.id}`);
});
```

### Working with Groups

```typescript
import { Group } from "shapekit";

const group = new Group({
  children: [shape1, shape2, shape3],
});

// Transform entire group
transformer.select(group);

// Transform individual children within group
transformer.select(...group.children);
```

## Transformation Operations

### Translation

```typescript
// Move selection by delta
transformer.translate({ x: 50, y: -25 });

// Set absolute position
transformer.x = 100;
transformer.y = 200;

// Apply changes
transformer.apply();
```

### Rotation

```typescript
// Rotate around center
transformer.rotation = Math.PI / 6; // 30 degrees

// Interactive rotation from handle
transformer.rotate(
  { x: 150, y: 100 }, // Handle position
  { x: 10, y: 5 } // Mouse delta
);

transformer.apply();
```

### Scaling

```typescript
// Uniform scaling
transformer.scaleX = 1.5;
transformer.scaleY = 1.5;

// Non-uniform scaling
transformer.scaleX = 2.0;
transformer.scaleY = 0.5;

// Interactive resize from handle
transformer.resize(
  { x: 200, y: 150 }, // Handle position
  { x: 15, y: -10 } // Mouse delta
);

transformer.apply();
```

### Size Control

```typescript
// Direct size manipulation
transformer.width = 200;
transformer.height = 150;

// Proportional scaling
const aspectRatio = transformer.width / transformer.height;
transformer.height = 100;
transformer.width = 100 * aspectRatio;

transformer.apply();
```

## Interactive Manipulation

### Building Drag Handlers

```typescript
class TransformUI {
  constructor(transformer) {
    this.transformer = transformer;
    this.isDragging = false;
    this.startPos = { x: 0, y: 0 };
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.startPos = { x: event.clientX, y: event.clientY };

    // Store initial state
    this.transformer.commit();
  }

  onMouseMove(event) {
    if (!this.isDragging) return;

    const delta = {
      x: event.clientX - this.startPos.x,
      y: event.clientY - this.startPos.y,
    };

    this.transformer.translate(delta);
    this.transformer.apply();
  }

  onMouseUp(event) {
    if (this.isDragging) {
      this.transformer.commit();
      this.isDragging = false;
    }
  }
}
```

### Rotation Handles

```typescript
class RotationHandle {
  constructor(transformer, canvas) {
    this.transformer = transformer;
    this.canvas = canvas;
  }

  onRotationDrag(handlePos, delta) {
    this.transformer.rotate(handlePos, delta);
    this.transformer.apply();
    this.canvas.update();
  }

  getHandlePosition() {
    const bbox = this.transformer.bbox;
    return {
      x: bbox.center.x,
      y: bbox.min.y - 30, // 30px above center
    };
  }
}
```

### Resize Handles

```typescript
class ResizeHandles {
  constructor(transformer) {
    this.transformer = transformer;
    this.handles = this.createHandles();
  }

  createHandles() {
    return [
      { name: "tl", cursor: "nw-resize" }, // Top-left
      { name: "tr", cursor: "ne-resize" }, // Top-right
      { name: "bl", cursor: "sw-resize" }, // Bottom-left
      { name: "br", cursor: "se-resize" }, // Bottom-right
      { name: "t", cursor: "n-resize" }, // Top
      { name: "r", cursor: "e-resize" }, // Right
      { name: "b", cursor: "s-resize" }, // Bottom
      { name: "l", cursor: "w-resize" }, // Left
    ];
  }

  getHandlePositions() {
    const bbox = this.transformer.bbox;
    const { min, max, center } = bbox;

    return {
      tl: { x: min.x, y: min.y },
      tr: { x: max.x, y: min.y },
      bl: { x: min.x, y: max.y },
      br: { x: max.x, y: max.y },
      t: { x: center.x, y: min.y },
      r: { x: max.x, y: center.y },
      b: { x: center.x, y: max.y },
      l: { x: min.x, y: center.y },
    };
  }

  onResizeDrag(handleName, delta) {
    const positions = this.getHandlePositions();
    const handlePos = positions[handleName];

    this.transformer.resize(handlePos, delta);
    this.transformer.apply();
  }
}
```

## Building Transform UIs

### Complete Transform Widget

```typescript
class TransformWidget {
  constructor(canvas, transformer) {
    this.canvas = canvas;
    this.transformer = transformer;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.element.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    this.canvas.element.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.canvas.element.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    const pos = this.getMousePos(event);
    const handle = this.getHandleAt(pos);

    if (handle) {
      this.startTransform(handle, pos);
    } else if (this.isInsideSelection(pos)) {
      this.startMove(pos);
    }
  }

  getHandleAt(pos) {
    const handles = this.getVisibleHandles();
    const handleSize = 8;

    for (const handle of handles) {
      const distance = Math.hypot(pos.x - handle.x, pos.y - handle.y);

      if (distance <= handleSize) {
        return handle;
      }
    }

    return null;
  }

  isInsideSelection(pos) {
    if (this.transformer.selection.length === 0) return false;

    // Use bounds module for precise testing
    import { contains } from "shapekit/bounds";
    return this.transformer.selection.some((shape) => contains(shape, pos));
  }

  render() {
    if (this.transformer.selection.length === 0) return;

    const ctx = this.canvas.ctx;
    this.renderSelectionOutline(ctx);
    this.renderHandles(ctx);
  }

  renderSelectionOutline(ctx) {
    const bbox = this.transformer.bbox;

    ctx.save();
    ctx.strokeStyle = "#007ACC";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.rect(bbox.min.x, bbox.min.y, bbox.width, bbox.height);
    ctx.stroke();

    ctx.restore();
  }

  renderHandles(ctx) {
    const handles = this.getVisibleHandles();

    ctx.save();
    ctx.fillStyle = "#007ACC";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    for (const handle of handles) {
      ctx.beginPath();
      ctx.rect(handle.x - 4, handle.y - 4, 8, 8);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
```

### Keyboard Shortcuts

```typescript
class TransformShortcuts {
  constructor(transformer) {
    this.transformer = transformer;
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  onKeyDown(event) {
    if (this.transformer.selection.length === 0) return;

    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case "ArrowLeft":
        this.transformer.translate({ x: -step, y: 0 });
        break;
      case "ArrowRight":
        this.transformer.translate({ x: step, y: 0 });
        break;
      case "ArrowUp":
        this.transformer.translate({ x: 0, y: -step });
        break;
      case "ArrowDown":
        this.transformer.translate({ x: 0, y: step });
        break;
      case "Delete":
      case "Backspace":
        this.deleteSelection();
        break;
      case "Escape":
        this.transformer.select(); // Clear selection
        break;
    }

    this.transformer.apply();
    event.preventDefault();
  }

  deleteSelection() {
    this.transformer.selection.forEach((shape) => {
      if (shape.parent) {
        shape.parent.remove(shape);
      }
    });
    this.transformer.select();
  }
}
```

## Advanced Features

### Snapping

```typescript
class SnapTransformer extends Transformer {
  constructor(snapDistance = 10) {
    super();
    this.snapDistance = snapDistance;
    this.snapTargets = [];
  }

  setSnapTargets(targets) {
    this.snapTargets = targets;
  }

  apply() {
    this.applySnapping();
    super.apply();
  }

  applySnapping() {
    const bbox = this.bbox;
    const snapPoints = [
      bbox.center,
      bbox.min,
      bbox.max,
      { x: bbox.center.x, y: bbox.min.y },
      { x: bbox.center.x, y: bbox.max.y },
      { x: bbox.min.x, y: bbox.center.y },
      { x: bbox.max.x, y: bbox.center.y },
    ];

    for (const target of this.snapTargets) {
      const targetBBox = getBBox(target);
      const targetPoints = [targetBBox.center, targetBBox.min, targetBBox.max];

      for (const snapPoint of snapPoints) {
        for (const targetPoint of targetPoints) {
          const distance = Math.hypot(
            snapPoint.x - targetPoint.x,
            snapPoint.y - targetPoint.y
          );

          if (distance < this.snapDistance) {
            const offset = {
              x: targetPoint.x - snapPoint.x,
              y: targetPoint.y - snapPoint.y,
            };
            this.translate(offset);
            return; // Snap to first found target
          }
        }
      }
    }
  }
}
```

### Multi-step Operations

```typescript
class HistoryTransformer extends Transformer {
  constructor() {
    super();
    this.history = [];
    this.historyIndex = -1;
  }

  commit() {
    super.commit();

    // Save state to history
    const state = this.saveState();
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  saveState() {
    return this.selection.map((shape) => ({
      shape,
      x: shape.x,
      y: shape.y,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      rotation: shape.rotation,
      skewX: shape.skewX,
      skewY: shape.skewY,
    }));
  }

  restoreState(state) {
    state.forEach(({ shape, ...props }) => {
      Object.assign(shape, props);
      shape.update();
    });
  }
}
```

### Performance Optimization

```typescript
class OptimizedTransformer extends Transformer {
  constructor() {
    super();
    this.isTransforming = false;
    this.pendingUpdate = false;
  }

  apply() {
    if (this.isTransforming) {
      this.pendingUpdate = true;
      return;
    }

    this.isTransforming = true;
    super.apply();

    // Batch updates using requestAnimationFrame
    requestAnimationFrame(() => {
      this.isTransforming = false;
      if (this.pendingUpdate) {
        this.pendingUpdate = false;
        this.apply();
      }
    });
  }

  // Override for lightweight preview
  previewTransform() {
    // Only update visual representation, not actual shapes
    this.updatePreview();
  }

  updatePreview() {
    // Custom preview rendering logic
    // Could use a separate preview layer
  }
}
```

The transforms module enables the creation of sophisticated transformation interfaces similar to those found in professional design tools. Combine it with the bounds module for precise interaction and the core module for flexible rendering.
