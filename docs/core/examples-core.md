# Core Module Guide

The core module (`shapekit`) provides the fundamental building blocks for creating 2D graphics. It includes renderables, path primitives, styling options, and the Canvas2D renderer.

The API reference can be accessed [here](./api-core.md).

## Table of Contents

- [Renderables](#renderables)
- [Path System](#path-system)
- [Styling](#styling)
- [Canvas2D Renderer](#canvas2d-renderer)
- [Transformations](#transformations)

## Renderables

Renderables are the core components that make up your 2D scene. All renderables support transformations and can be composed together.

### Base Properties

All renderables inherit these transform properties:

```typescript
interface Transform {
  x: number; // X translation
  y: number; // Y translation
  scaleX: number; // X scale factor
  scaleY: number; // Y scale factor
  skewX: number; // X skew in radians
  skewY: number; // Y skew in radians
  rotation: number; // Rotation in radians
}
```

### Shape

The `Shape` class renders vector paths with styling:

```typescript
import { Shape, rect, moveTo, lineTo } from "shapekit";

const rectangle = new Shape({
  x: 100,
  y: 100,
  fill: "red",
  stroke: "black",
  lineWidth: 2,
  path: [rect(0, 0, 50, 30)],
});

const customPath = new Shape({
  x: 200,
  y: 100,
  stroke: "blue",
  lineWidth: 3,
  lineCap: "round",
  path: [moveTo(0, 0), lineTo(50, 25), lineTo(0, 50)],
});
```

**Shape Properties:**

- All Canvas2D styling properties (`fill`, `stroke`, `lineWidth`, `lineCap`, etc.)
- `path`: Array of path segments
- `fillStyle` → `fill`, `strokeStyle` → `stroke` (simplified names)

### Group

The `Group` class acts as a container for other renderables:

```typescript
import { Group, Shape, rect } from "shapekit";

const group = new Group({
  x: 200,
  y: 150,
  rotation: Math.PI / 4,
  children: [
    new Shape({
      x: -25,
      y: -25,
      fill: "red",
      path: [rect(0, 0, 50, 50)],
    }),
    new Shape({
      x: 25,
      y: 25,
      fill: "blue",
      path: [rect(0, 0, 30, 30)],
    }),
  ],
});

// Add children dynamically
group.add(
  new Shape({
    /* ... */
  })
);
group.remove(childShape);
```

**Group Features:**

- Hierarchical transformations (children inherit parent transforms)
- Batch operations on multiple renderables
- Scene graph organization

### Text

The `Text` class renders text with automatic wrapping:

```typescript
import { Text } from "shapekit";

const text = new Text({
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  text: "Hello, ShapeKit! This text will wrap automatically.",
  textFill: "black",
  textStroke: "white",
  fontSize: 16,
  lineHeight: 20,
  textAlign: "center",
  padding: 10,
});
```

**Text Properties:**

- `text`: Text content
- `width`/`height`: Text box dimensions
- `textFill`/`textStroke`: Text styling
- `fontSize`, `fontFamily`, `lineHeight`
- `textAlign`: "left" | "center" | "right"
- `padding`: Inner padding

### Image

The `Image` class renders bitmap images:

```typescript
import { Image } from "shapekit";

// Load image first
const imageElement = await Image.load("path/to/image.png");

const sprite = new Image({
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  image: imageElement,
});
```

**Image Properties:**

- `image`: HTMLImageElement
- `width`/`height`: Display dimensions (optional, uses natural size if omitted)

### Clip

The `Clip` class creates clipping masks:

```typescript
import { Clip, Group, Shape, rect, arc } from "shapekit";

const clippedGroup = new Group({
  children: [
    new Clip({
      path: [rect(0, 0, 100, 100)], // Clip to rectangle
    }),
    new Shape({
      x: 50,
      y: 50,
      fill: "red",
      path: [arc(0, 0, 75, 0, Math.PI * 2)], // Circle clipped by rectangle
    }),
  ],
});
```

## Path System

ShapeKit provides functions that mirror the Canvas2D Path2D API:

### Basic Shapes

```typescript
import { rect, roundRect, arc, ellipse } from "shapekit";

// Rectangle
rect(x, y, width, height)

// Rounded rectangle
roundRect(x, y, width, height, radius)

// Arc/Circle
arc(x, y, radius, startAngle, endAngle, counterclockwise?)

// Ellipse
ellipse(x, y, radiusX, radiusY, rotation?)
```

### Path Commands

```typescript
import {
  moveTo,
  lineTo,
  arcTo,
  bezierCurveTo,
  quadraticCurveTo,
  closePath,
} from "shapekit";

// Move pen without drawing
moveTo(x, y);

// Draw straight line
lineTo(x, y);

// Draw arc between points
arcTo(x1, y1, x2, y2, radius);

// Cubic bezier curve
bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);

// Smooth cubic bezier curve (SVG-style)
// First control point computed from previous segment
bezierCurveTo(cp2x, cp2y, x, y);

// Quadratic bezier curve
quadraticCurveTo(cpx, cpy, x, y);

// Smooth quadratic bezier curve (SVG-style)
// Control point computed from previous segment
quadraticCurveTo(x, y);

// Close current path
closePath();
```

### Complex Paths

```typescript
const star = new Shape({
  fill: "gold",
  stroke: "orange",
  lineWidth: 2,
  path: [
    moveTo(0, -50),
    lineTo(15, -15),
    lineTo(50, -10),
    lineTo(25, 15),
    lineTo(30, 50),
    lineTo(0, 30),
    lineTo(-30, 50),
    lineTo(-25, 15),
    lineTo(-50, -10),
    lineTo(-15, -15),
    closePath(),
  ],
});
```

### Smooth Bezier Curves (SVG-style)

ShapeKit supports smooth bezier curves similar to SVG's S and T commands:

```typescript
const smoothPath = new Shape({
  stroke: "blue",
  lineWidth: 3,
  fill: "none",
  path: [
    moveTo(10, 80),
    // Regular bezier curve
    bezierCurveTo(40, 10, 65, 10, 95, 80),
    // Smooth continuation - first control point computed automatically
    bezierCurveTo(125, 150, 180, 80), // Only specify second control point and end
    // Another smooth continuation
    bezierCurveTo(210, 10, 240, 80),
  ],
});

const smoothQuadratic = new Shape({
  stroke: "red",
  lineWidth: 3,
  fill: "none",
  path: [
    moveTo(10, 150),
    // Regular quadratic curve
    quadraticCurveTo(52.5, 100, 95, 150),
    // Smooth continuation - control point computed automatically
    quadraticCurveTo(180, 150), // Only specify end point
    // Another smooth continuation
    quadraticCurveTo(265, 150),
  ],
});
```

## Styling

### Solid Colors

```typescript
const shape = new Shape({
  fill: "red", // Named color
  stroke: "#0066ff", // Hex color
  fill: "rgb(255, 0, 0)", // RGB
  stroke: "rgba(0, 102, 255, 0.5)", // RGBA
});
```

### Gradients

#### Linear Gradient

```typescript
import { linearGradient } from "shapekit";

const shape = new Shape({
  fill: linearGradient(
    0,
    0, // Start point (x1, y1)
    100,
    0, // End point (x2, y2)
    {
      0: "red", // Color stops
      50: "yellow",
      100: "blue",
    }
  ),
  path: [rect(0, 0, 100, 50)],
});
```

#### Radial Gradient

```typescript
import { radialGradient } from "shapekit";

const shape = new Shape({
  fill: radialGradient(
    50,
    50,
    0, // Start circle (x1, y1, r1)
    50,
    50,
    50, // End circle (x2, y2, r2)
    {
      0: "white",
      100: "black",
    }
  ),
  path: [rect(0, 0, 100, 100)],
});
```

#### Conic Gradient

```typescript
import { conicGradient } from "shapekit";

const shape = new Shape({
  fill: conicGradient(
    50,
    50, // Center point (x, y)
    0, // Start angle
    {
      0: "red",
      25: "yellow",
      50: "green",
      75: "blue",
      100: "red",
    }
  ),
  path: [rect(0, 0, 100, 100)],
});
```

### Patterns

```typescript
import { pattern } from "shapekit";

// From image
const imagePattern = await pattern(imageElement, "repeat");

// From canvas
const patternCanvas = document.createElement("canvas");
// ... draw pattern on canvas ...
const canvasPattern = pattern(patternCanvas, "repeat-x");

const shape = new Shape({
  fill: imagePattern,
  path: [rect(0, 0, 200, 200)],
});
```

### Line Styling

```typescript
const line = new Shape({
  stroke: "blue",
  lineWidth: 5,
  lineCap: "round", // "butt" | "round" | "square"
  lineJoin: "round", // "round" | "bevel" | "miter"
  lineDash: [10, 5], // Dash pattern
  lineDashOffset: 0, // Dash offset
  miterLimit: 10, // Miter limit
  path: [
    /* path segments */
  ],
});
```

### Shadow Effects

```typescript
const shape = new Shape({
  fill: "red",
  shadowColor: "rgba(0, 0, 0, 0.5)",
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  path: [rect(0, 0, 100, 100)],
});
```

## Canvas2D Renderer

The `Canvas2D` class renders your scene to an HTML5 canvas:

```typescript
import { Canvas2D, Group } from "shapekit";

const scene = new Group({
  children: [
    /* your renderables */
  ],
});

const canvas = new Canvas2D(scene, {
  width: 800,
  height: 600,
  contextAttributes: {
    alpha: false, // Disable transparency
    desynchronized: true, // Allow async rendering
  },
});

// Access the canvas element
document.body.appendChild(canvas.element);

// Access the 2D context
const ctx = canvas.ctx;

// Render the scene
canvas.update();
```

**Canvas2D Features:**

- Automatic scene traversal and rendering
- Optimized transform matrix calculations
- Support for all Canvas2D context attributes
- Efficient clipping and compositing

## Transformations

All renderables support 2D transformations that compose hierarchically:

```typescript
const parent = new Group({
  x: 100, // Translate
  y: 100,
  scaleX: 2, // Scale
  scaleY: 0.5,
  rotation: Math.PI / 4, // Rotate 45 degrees
  skewX: 0.1, // Skew
  skewY: 0,
  children: [
    new Shape({
      x: 50, // Relative to parent
      y: 25,
      rotation: Math.PI / 8, // Additional rotation
      // ... shape properties
    }),
  ],
});
```

**Transform Order:**

1. Scale
2. Skew
3. Rotate
4. Translate

**Matrix Access:**

```typescript
renderable.update(); // Ensure transforms are calculated
const matrix = renderable.transform; // Matrix3 instance
```

### Utility Functions

```typescript
import { walk } from "shapekit";

// Traverse scene graph
walk(scene, (renderable) => {
  console.log(renderable.id, renderable.constructor.name);
  // Return renderable to stop traversal at this branch
});

// Find specific renderables
const shapes = [];
walk(scene, (renderable) => {
  if (renderable instanceof Shape) {
    shapes.push(renderable);
  }
});
```

This covers the core module's main features. For geometry analysis and hit-testing, see the [Bounds Module Guide](./bounds.md). For advanced transformations, see the [Transforms Module Guide](./transforms.md).
