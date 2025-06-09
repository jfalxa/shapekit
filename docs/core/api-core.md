# Core API Reference

Complete API reference for the core ShapeKit module (`shapekit`).

## Table of Contents

- [Renderables](#renderables)
- [Path Functions](#path-functions)
- [Styles](#styles)
- [Canvas2D Renderer](#canvas2d-renderer)
- [Utility Functions](#utility-functions)

## Renderables

### Renderable (Base Class)

Base class for all renderable objects.

```typescript
interface RenderableInit {
  id?: string;
  hidden?: boolean;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  rotation?: number;
}

class Renderable {
  id?: string;
  hidden: boolean;
  parent?: Group;

  // Transform properties
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotation: number;

  // Computed transform matrix
  transform: Matrix3;

  constructor(init?: RenderableInit);
  update(): void;
}
```

### Shape

Renders vector paths with styling.

```typescript
interface ShapeStyle {
  fill?: Style;
  stroke?: Style;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;
  lineDash?: number[];
}

interface ShapeInit extends RenderableInit, ShapeStyle {
  path: PathLike;
  quality?: number;
}

class Shape extends Renderable {
  path: Path;

  // Style properties
  fill?: Style;
  stroke?: Style;
  lineWidth?: number;
  lineCap?: CanvasLineCap; // "butt" | "round" | "square"
  lineJoin?: CanvasLineJoin; // "round" | "bevel" | "miter"
  lineDashOffset?: number;
  miterLimit?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalAlpha?: number;
  filter?: string;
  lineDash?: number[];

  constructor(init: ShapeInit);
}
```

### Group

Container for other renderables with hierarchical transformations.

```typescript
interface GroupStyle {
  globalCompositeOperation?: GlobalCompositeOperation;
}

interface GroupInit extends RenderableInit, GroupStyle {
  children?: Renderable[];
}

class Group extends Renderable {
  children: Renderable[];
  globalCompositeOperation?: GlobalCompositeOperation;

  constructor(init?: GroupInit);

  // Child management
  add(...children: Renderable[]): void;
  insert(index: number, ...children: Renderable[]): void;
  remove(...children: Renderable[]): void;
}
```

### Text

Renders text with automatic wrapping and styling.

```typescript
interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  textFill?: Style;
  textStroke?: Style;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign; // "start" | "end" | "left" | "right" | "center"
  textBaseline?: CanvasTextBaseline; // "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"
  direction?: CanvasDirection; // "ltr" | "rtl" | "inherit"
  textVerticalAlign?: "top" | "middle" | "bottom";
  padding?: number;
}

interface TextInit extends RenderableInit, TextStyle {
  text: string;
  width?: number;
  height?: number;
}

class Text extends Renderable {
  text: string;
  width?: number;
  height?: number;

  // Computed dimensions
  naturalWidth: number;
  naturalHeight: number;

  // Style properties
  fontFamily?: string;
  fontSize?: number;
  fontStretch?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  lineHeight?: number;
  textFill?: Style;
  textStroke?: Style;
  textLineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textVerticalAlign?: "top" | "middle" | "bottom";
  direction?: CanvasDirection;
  padding?: number;

  // Computed properties
  font: string;
  lines: [string, number, number][];

  constructor(init: TextInit);

  getWidth(): number;
  getHeight(): number;
}
```

### Image

Renders bitmap images.

```typescript
interface ImageInit extends RenderableInit {
  image: CanvasImageSource;
  width?: number;
  height?: number;
}

class Image extends Renderable {
  image: CanvasImageSource;
  width?: number;
  height?: number;

  // Natural dimensions
  naturalWidth: number;
  naturalHeight: number;

  constructor(init: ImageInit);

  getWidth(): number;
  getHeight(): number;

  // Static methods
  static load(src: string): Promise<HTMLImageElement>;
  static dimensions(source: CanvasImageSource): [number, number];
}
```

### Clip

Creates clipping masks using paths.

```typescript
interface ClipInit extends RenderableInit {
  path: PathLike;
  fillRule?: CanvasFillRule; // "nonzero" | "evenodd"
}

class Clip extends Shape {
  fillRule?: CanvasFillRule;

  constructor(init: ClipInit);
}
```

## Path Functions

### Basic Shapes

```typescript
// Rectangle
function rect(x: number, y: number, width: number, height: number): Rect;

// Rounded rectangle
function roundRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radii?: number | number[]
): RoundRect;

// Circle/Arc
function arc(
  x: number,
  y: number,
  radius: number,
  startAngle?: number, // Default: 0
  endAngle?: number, // Default: 2π
  counterclockwise?: boolean // Default: false
): Arc;

// Ellipse
function ellipse(
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation?: number, // Default: 0
  startAngle?: number, // Default: 0
  endAngle?: number, // Default: 2π
  counterclockwise?: boolean // Default: false
): Ellipse;
```

### Path Commands

```typescript
// Move pen to position
function moveTo(x: number, y: number): MoveTo;

// Draw line to position
function lineTo(x: number, y: number): LineTo;

// Draw arc between two points
function arcTo(
  x1: number,
  y1: number, // Control point
  x2: number,
  y2: number, // End point
  radius: number
): ArcTo;

// Cubic bezier curve
function bezierCurveTo(
  cp1x: number,
  cp1y: number, // First control point
  cp2x: number,
  cp2y: number, // Second control point
  x: number,
  y: number // End point
): BezierCurveTo;

// Smooth cubic bezier curve (SVG-style)
// Automatically computes first control point based on previous segment
function bezierCurveTo(
  cp2x: number,
  cp2y: number, // Second control point
  x: number,
  y: number // End point
): BezierCurveTo;

// Quadratic bezier curve
function quadraticCurveTo(
  cpx: number,
  cpy: number, // Control point
  x: number,
  y: number // End point
): QuadraticCurveTo;

// Smooth quadratic bezier curve (SVG-style)
// Automatically computes control point based on previous segment
function quadraticCurveTo(
  x: number,
  y: number // End point
): QuadraticCurveTo;

// Close current path
function closePath(): ClosePath;
```

### Path Types

```typescript
// Union type for path segments
type PathLike = Segment | Segment[];

// Path class
class Path extends Array<Segment> {
  constructor(segments: PathLike, quality?: number, owner?: Shape);
}

// Base segment class
class Segment {
  x: number;
  y: number;

  constructor(x: number, y: number);
}
```

## Styles

### Style Types

```typescript
type Style = string | Gradient | Pattern;
```

### Gradients

```typescript
// Linear gradient
function linearGradient(
  x1: number,
  y1: number, // Start point
  x2: number,
  y2: number, // End point
  stops: Record<number, string> // Color stops (0-100)
): LinearGradient;

// Radial gradient
function radialGradient(
  x1: number,
  y1: number,
  r1: number, // Start circle
  x2: number,
  y2: number,
  r2: number, // End circle
  stops: Record<number, string> // Color stops (0-100)
): RadialGradient;

// Conic gradient
function conicGradient(
  x: number,
  y: number, // Center point
  angle: number, // Start angle
  stops: Record<number, string> // Color stops (0-100)
): ConicGradient;
```

### Patterns

```typescript
function pattern(
  image: CanvasImageSource,
  repetition?: string // "repeat" | "repeat-x" | "repeat-y" | "no-repeat"
): Pattern;
```

### Gradient Classes

```typescript
class LinearGradient extends Gradient {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: Record<number, string>;

  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: Record<number, string>
  );
  get(ctx: CanvasRenderingContext2D): CanvasGradient;
}

class RadialGradient extends Gradient {
  x1: number;
  y1: number;
  r1: number;
  x2: number;
  y2: number;
  r2: number;
  stops: Record<number, string>;

  constructor(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number,
    stops: Record<number, string>
  );
  get(ctx: CanvasRenderingContext2D): CanvasGradient;
}

class ConicGradient extends Gradient {
  x: number;
  y: number;
  angle: number;
  stops: Record<number, string>;

  constructor(
    x: number,
    y: number,
    angle: number,
    stops: Record<number, string>
  );
  get(ctx: CanvasRenderingContext2D): CanvasGradient;
}

class Pattern {
  image: CanvasImageSource;
  repetition: string;

  constructor(image: CanvasImageSource, repetition?: string);
  get(ctx: CanvasRenderingContext2D): CanvasPattern | null;
}
```

## Canvas2D Renderer

### Canvas2D Class

```typescript
interface Canvas2DInit {
  width: number;
  height: number;
  fill?: Style; // Background fill
  contextAttributes?: CanvasRenderingContext2DSettings;
}

class Canvas2D {
  scene: Group;
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fill: Style;

  constructor(scene: Group, init: Canvas2DInit);

  // Update and render the scene
  update(): void;

  // Internal rendering
  render(renderable: Renderable): void;
}
```

## Utility Functions

### Scene Graph Traversal

```typescript
function walk<T = void>(
  renderable: Renderable,
  operation: (renderable: Renderable) => T
): T;
```

**Parameters:**

- `renderable` - Root renderable to traverse
- `operation` - Function to call for each renderable

**Returns:** The first non-undefined value returned by `operation`, or `undefined`

**Usage:**

```typescript
// Find all shapes
const shapes: Shape[] = [];
walk(scene, (renderable) => {
  if (renderable instanceof Shape) {
    shapes.push(renderable);
  }
});

// Find first shape with specific ID
const found = walk(scene, (renderable) => {
  if (renderable.id === "target") {
    return renderable; // Stops traversal
  }
});
```

### Math Utilities

```typescript
// 3x3 transformation matrix
class Matrix3 {
  constructor(values?: number[]);

  // Matrix operations
  identity(): Matrix3;
  copy(other: Matrix3): Matrix3;
  multiply(other: Matrix3): Matrix3;
  transform(other: Matrix3): Matrix3;
  invert(): Matrix3;

  // Transformations
  translate(x: number, y: number): Matrix3;
  scale(x: number, y: number): Matrix3;
  rotate(angle: number): Matrix3;
  skew(x: number, y: number): Matrix3;
  compose(transform: Transform): Matrix3;
  decompose(): Transform;
}

// 2D vector
class Vec2 {
  x: number;
  y: number;

  constructor(x?: number, y?: number);

  // Vector operations
  put(x: number, y?: number): Vec2;
  copy(other: Vec2): Vec2;
  clone(): Vec2;
  add(other: Vec2 | number): Vec2;
  subtract(other: Vec2): Vec2;
  multiply(scalar: number): Vec2;
  scale(x: number, y?: number): Vec2;
  rotate(angle: number): Vec2;
  skew(x: number, y: number): Vec2;
  transform(matrix: Matrix3): Vec2;

  // Utility methods
  norm(): number;
  normalize(): Vec2;
  dot(other: Vec2): number;
  cross(other: Vec2): number;
}

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

### Helper Functions

```typescript
// Create Vec2 instance
function v(x?: number, y?: number): Vec2;
function v(point: Point): Vec2;
```

## Constants

```typescript
// Canvas line cap styles
type CanvasLineCap = "butt" | "round" | "square";

// Canvas line join styles
type CanvasLineJoin = "round" | "bevel" | "miter";

// Canvas text alignment
type CanvasTextAlign = "start" | "end" | "left" | "right" | "center";

// Canvas text baseline
type CanvasTextBaseline =
  | "top"
  | "hanging"
  | "middle"
  | "alphabetic"
  | "ideographic"
  | "bottom";

// Canvas direction
type CanvasDirection = "ltr" | "rtl" | "inherit";

// Canvas fill rule
type CanvasFillRule = "nonzero" | "evenodd";

// Canvas composite operations
type GlobalCompositeOperation =
  | "source-over"
  | "source-in"
  | "source-out"
  | "source-atop"
  | "destination-over"
  | "destination-in"
  | "destination-out"
  | "destination-atop"
  | "lighter"
  | "copy"
  | "xor"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";
```
