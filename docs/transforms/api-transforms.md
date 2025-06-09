# Transforms API Reference

Complete API reference for the transforms module (`shapekit/transforms`).

## Table of Contents

- [Transformer Class](#transformer-class)
- [Transform Operations](#transform-operations)
- [Selection Management](#selection-management)
- [Interactive Manipulation](#interactive-manipulation)
- [Path Transformations](#path-transformations)

## Transformer Class

The main class for managing multi-shape transformations.

### Constructor

```typescript
class Transformer {
  constructor(selection?: Renderable[]);
}
```

**Parameters:**
- `selection` - Optional initial selection of renderables

### Properties

#### Selection Properties

```typescript
class Transformer {
  // Current selection
  selection: Renderable[];
  
  // Combined bounding box of selection
  bbox: BBox;
}
```

#### Transform Properties

```typescript
class Transformer {
  // Position
  x: number;
  y: number;
  
  // Dimensions
  width: number;
  height: number;
  
  // Scale
  scaleX: number;
  scaleY: number;
  
  // Skew (in radians)
  skewX: number;
  skewY: number;
  
  // Rotation (in radians)
  rotation: number;
}
```

## Transform Operations

### Basic Operations

#### apply

Applies current transform values to the selected shapes.

```typescript
apply(): void;
```

**Usage:**
```typescript
transformer.x = 100;
transformer.y = 50;
transformer.rotation = Math.PI / 4;
transformer.apply(); // Updates the actual shapes
```

#### commit

Makes the current transform state permanent and updates internal snapshots.

```typescript
commit(): void;
```

**Usage:**
```typescript
// After making changes
transformer.apply();
transformer.commit(); // Makes changes permanent
```

#### revert

Reverts to the last committed state.

```typescript
revert(): void;
```

**Usage:**
```typescript
// Make some changes
transformer.x = 200;
transformer.apply();

// Decide to cancel
transformer.revert(); // Goes back to last committed state
```

### Interactive Operations

#### translate

Translates the selection by a delta amount.

```typescript
translate(delta: Point): void;
```

**Parameters:**
- `delta` - Translation offset `{ x: number, y: number }`

**Usage:**
```typescript
// Move selection 10 pixels right, 5 pixels down
transformer.translate({ x: 10, y: 5 });
transformer.apply();
```

#### rotate

Rotates the selection around its center using handle-based input.

```typescript
rotate(handle: Point, delta: Point): void;
```

**Parameters:**
- `handle` - Current handle position
- `delta` - Mouse movement delta

**Usage:**
```typescript
// In mouse move handler
const handlePos = getRotationHandlePosition();
const mouseDelta = { x: event.movementX, y: event.movementY };
transformer.rotate(handlePos, mouseDelta);
transformer.apply();
```

#### resize

Resizes the selection using handle-based input.

```typescript
resize(handle: Point, delta: Point): void;
```

**Parameters:**
- `handle` - Current resize handle position
- `delta` - Mouse movement delta

**Usage:**
```typescript
// In resize handle drag
const handlePos = getResizeHandlePosition("bottom-right");
const mouseDelta = { x: event.movementX, y: event.movementY };
transformer.resize(handlePos, mouseDelta);
transformer.apply();
```

## Selection Management

### select

Selects renderables for transformation.

```typescript
select(...renderables: Renderable[]): void;
```

**Parameters:**
- `renderables` - Renderables to select (clears previous selection)

**Usage:**
```typescript
// Select single shape
transformer.select(shape);

// Select multiple shapes
transformer.select(shape1, shape2, shape3);

// Select from array
transformer.select(...shapeArray);

// Clear selection
transformer.select();
```

### Selection Behavior

The transformer adapts its behavior based on selection:

```typescript
// Single shape: transforms the shape directly
transformer.select(singleShape);
transformer.rotation = Math.PI / 4; // Rotates the shape itself

// Multiple shapes: transforms as a group
transformer.select(shape1, shape2, shape3);
transformer.rotation = Math.PI / 4; // Rotates the group around center
```

## Interactive Manipulation

### Building Transform Interfaces

#### Example: Drag Handler

```typescript
class DragHandler {
  private transformer: Transformer;
  private isDragging = false;
  private startPos = { x: 0, y: 0 };
  
  constructor(transformer: Transformer) {
    this.transformer = transformer;
  }
  
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startPos = { x: event.clientX, y: event.clientY };
    this.transformer.commit(); // Save current state
  }
  
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const delta = {
      x: event.clientX - this.startPos.x,
      y: event.clientY - this.startPos.y
    };
    
    this.transformer.translate(delta);
    this.transformer.apply();
  }
  
  onMouseUp() {
    if (this.isDragging) {
      this.transformer.commit();
      this.isDragging = false;
    }
  }
}
```

#### Example: Rotation Handle

```typescript
class RotationHandle {
  private transformer: Transformer;
  
  constructor(transformer: Transformer) {
    this.transformer = transformer;
  }
  
  getPosition(): Point {
    const bbox = this.transformer.bbox;
    return {
      x: bbox.center.x,
      y: bbox.min.y - 30 // 30px above top
    };
  }
  
  onDrag(delta: Point) {
    const handlePos = this.getPosition();
    this.transformer.rotate(handlePos, delta);
    this.transformer.apply();
  }
}
```

#### Example: Resize Handles

```typescript
type HandleType = "tl" | "tr" | "bl" | "br" | "t" | "r" | "b" | "l";

class ResizeHandles {
  private transformer: Transformer;
  
  constructor(transformer: Transformer) {
    this.transformer = transformer;
  }
  
  getPositions(): Record<HandleType, Point> {
    const bbox = this.transformer.bbox;
    const { min, max, center } = bbox;
    
    return {
      tl: { x: min.x, y: min.y },     // Top-left
      tr: { x: max.x, y: min.y },     // Top-right
      bl: { x: min.x, y: max.y },     // Bottom-left
      br: { x: max.x, y: max.y },     // Bottom-right
      t:  { x: center.x, y: min.y },  // Top
      r:  { x: max.x, y: center.y },  // Right
      b:  { x: center.x, y: max.y },  // Bottom
      l:  { x: min.x, y: center.y }   // Left
    };
  }
  
  onHandleDrag(handle: HandleType, delta: Point) {
    const positions = this.getPositions();
    const handlePos = positions[handle];
    
    this.transformer.resize(handlePos, delta);
    this.transformer.apply();
  }
  
  getCursor(handle: HandleType): string {
    const cursors: Record<HandleType, string> = {
      tl: "nw-resize", tr: "ne-resize",
      bl: "sw-resize", br: "se-resize",
      t: "n-resize", r: "e-resize",
      b: "s-resize", l: "w-resize"
    };
    return cursors[handle];
  }
}
```

### Complete Transform Widget

```typescript
class TransformWidget {
  private transformer: Transformer;
  private canvas: Canvas2D;
  private dragHandler: DragHandler;
  private rotationHandle: RotationHandle;
  private resizeHandles: ResizeHandles;
  
  constructor(canvas: Canvas2D, transformer: Transformer) {
    this.canvas = canvas;
    this.transformer = transformer;
    this.dragHandler = new DragHandler(transformer);
    this.rotationHandle = new RotationHandle(transformer);
    this.resizeHandles = new ResizeHandles(transformer);
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.element.addEventListener("mouseup", this.onMouseUp.bind(this));
  }
  
  onMouseDown(event: MouseEvent) {
    const pos = this.getMousePos(event);
    const handle = this.getHandleAt(pos);
    
    if (handle) {
      this.startHandleDrag(handle, pos);
    } else if (this.isInsideSelection(pos)) {
      this.dragHandler.onMouseDown(event);
    }
  }
  
  private getMousePos(event: MouseEvent): Point {
    const rect = this.canvas.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  private getHandleAt(pos: Point): string | null {
    // Check rotation handle
    const rotHandle = this.rotationHandle.getPosition();
    if (this.distanceToPoint(pos, rotHandle) < 8) {
      return "rotation";
    }
    
    // Check resize handles
    const resizePositions = this.resizeHandles.getPositions();
    for (const [handle, handlePos] of Object.entries(resizePositions)) {
      if (this.distanceToPoint(pos, handlePos) < 8) {
        return handle;
      }
    }
    
    return null;
  }
  
  private distanceToPoint(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  
  private isInsideSelection(pos: Point): boolean {
    return this.transformer.selection.some(shape => 
      contains(shape, pos)
    );
  }
  
  render() {
    if (this.transformer.selection.length === 0) return;
    
    const ctx = this.canvas.ctx;
    
    // Render selection outline
    this.renderSelectionOutline(ctx);
    
    // Render handles
    this.renderHandles(ctx);
  }
  
  private renderSelectionOutline(ctx: CanvasRenderingContext2D) {
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
  
  private renderHandles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = "#007ACC";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    
    // Resize handles
    const resizePositions = this.resizeHandles.getPositions();
    for (const pos of Object.values(resizePositions)) {
      this.renderHandle(ctx, pos, 6);
    }
    
    // Rotation handle
    const rotPos = this.rotationHandle.getPosition();
    this.renderHandle(ctx, rotPos, 6, "circle");
    
    ctx.restore();
  }
  
  private renderHandle(
    ctx: CanvasRenderingContext2D, 
    pos: Point, 
    size: number, 
    shape: "square" | "circle" = "square"
  ) {
    ctx.beginPath();
    
    if (shape === "circle") {
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(pos.x - size / 2, pos.y - size / 2, size, size);
    }
    
    ctx.fill();
    ctx.stroke();
  }
}
```

## Path Transformations

### Path Utilities

The transforms module includes utilities for transforming paths:

```typescript
// Copy path segments
function copyPath(source: Segment[], target: Segment[]): Segment[];

// Clone path segments
function clonePath(source: Segment[]): Segment[];

// Scale path segments
function scalePath(path: Segment[], scaleX: number, scaleY: number): Segment[];
```

### Internal Interfaces

#### Snapshot Interface

Internal interface used by Transformer for state management:

```typescript
interface Snapshot extends Transform {
  transform: Matrix3;
  invParentTransform: Matrix3;
  path: Segment[];
  bbox: BBox;
}
```

### Advanced Usage

#### Custom Transformer

```typescript
class CustomTransformer extends Transformer {
  // Add snapping
  private snapDistance = 10;
  private snapTargets: Renderable[] = [];
  
  setSnapTargets(targets: Renderable[]) {
    this.snapTargets = targets;
  }
  
  apply() {
    this.applySnapping();
    super.apply();
  }
  
  private applySnapping() {
    if (this.snapTargets.length === 0) return;
    
    const bbox = this.bbox;
    const snapPoints = [bbox.center, bbox.min, bbox.max];
    
    for (const target of this.snapTargets) {
      const targetBBox = getBBox(target);
      const targetPoints = [targetBBox.center, targetBBox.min, targetBBox.max];
      
      for (const snapPoint of snapPoints) {
        for (const targetPoint of targetPoints) {
          const distance = Vec2.distance(snapPoint, targetPoint);
          
          if (distance < this.snapDistance) {
            const offset = {
              x: targetPoint.x - snapPoint.x,
              y: targetPoint.y - snapPoint.y
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

#### History System

```typescript
interface TransformState {
  shape: Renderable;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
}

class HistoryTransformer extends Transformer {
  private history: TransformState[][] = [];
  private historyIndex = -1;
  
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
  
  private saveState(): TransformState[] {
    return this.selection.map(shape => ({
      shape,
      x: shape.x,
      y: shape.y,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      rotation: shape.rotation,
      skewX: shape.skewX,
      skewY: shape.skewY
    }));
  }
  
  private restoreState(state: TransformState[]) {
    state.forEach(({ shape, ...props }) => {
      Object.assign(shape, props);
      shape.update();
    });
  }
}
```

## Type Definitions

```typescript
// Point interface
interface Point {
  x: number;
  y: number;
}

// Transform interface
interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotation: number;
}
```

## Performance Notes

1. **Batching**: Call `apply()` once after making multiple property changes
2. **Commit Strategy**: Only call `commit()` when you want to make changes permanent (e.g., mouse up)
3. **Revert Usage**: Use `revert()` for cancel operations without rebuilding state
4. **Selection Size**: Performance scales with selection size - consider limits for very large selections

## Common Patterns

### Transform Tool State Machine

```typescript
type ToolState = "idle" | "dragging" | "rotating" | "resizing";

class TransformTool {
  private state: ToolState = "idle";
  private transformer: Transformer;
  
  constructor(transformer: Transformer) {
    this.transformer = transformer;
  }
  
  onMouseDown(event: MouseEvent) {
    switch (this.state) {
      case "idle":
        const handle = this.getHandleAt(event);
        if (handle === "rotation") {
          this.state = "rotating";
        } else if (handle?.includes("resize")) {
          this.state = "resizing";
        } else {
          this.state = "dragging";
        }
        this.transformer.commit();
        break;
    }
  }
  
  onMouseUp() {
    if (this.state !== "idle") {
      this.transformer.commit();
      this.state = "idle";
    }
  }
}
```