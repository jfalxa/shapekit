# Bounds API Reference

Complete API reference for the bounds module (`shapekit/bounds`).

## Table of Contents

- [Hit Testing](#hit-testing)
- [Collision Detection](#collision-detection)
- [Bounding Boxes](#bounding-boxes)
- [Geometry Analysis](#geometry-analysis)
- [Curve Sampling](#curve-sampling)
- [AABB Operations](#aabb-operations)

## Hit Testing

### contains

Tests if a point is inside a shape or if one shape contains another.

```typescript
function contains(
  container: Renderable | BBox | AABB | Normalized,
  target: Renderable | BBox | AABB | Vec2 | Point | Normalized
): boolean;
```

**Parameters:**

- `container` - The containing shape or bounding area
- `target` - The point or shape to test

**Returns:** `true` if target is completely inside container

**Usage:**

```typescript
// Point-in-shape testing
const point = { x: 100, y: 100 };
if (contains(shape, point)) {
  console.log("Point is inside shape");
}

// Shape containment
if (contains(outerShape, innerShape)) {
  console.log("Inner shape is completely contained");
}

// Group testing (tests children recursively)
const clickedShape = walk(group, (child) => {
  if (contains(child, mousePos)) return child;
});
```

## Collision Detection

### overlaps

Tests if two shapes or bounding areas overlap.

```typescript
function overlaps(
  a: Renderable | BBox | AABB,
  b: Renderable | BBox | AABB
): boolean;
```

**Parameters:**

- `a` - First shape or bounding area
- `b` - Second shape or bounding area

**Returns:** `true` if the shapes overlap

**Usage:**

```typescript
// Basic collision detection
if (overlaps(player, enemy)) {
  handleCollision();
}

// Group collision (tests children recursively)
const collidingEnemies = enemies.filter((enemy) => overlaps(player, enemy));

// Bounding box collision (faster)
const playerBBox = getBBox(player);
const enemyBBox = getBBox(enemy);
if (overlaps(playerBBox, enemyBBox)) {
  // Detailed collision test
  if (overlaps(player, enemy)) {
    handleCollision();
  }
}
```

## Bounding Boxes

### getBBox

Gets the global bounding box (includes all transformations).

```typescript
function getBBox(renderable: Renderable, out?: BBox): BBox;
```

**Parameters:**

- `renderable` - The renderable to analyze
- `out` - Optional output BBox to reuse

**Returns:** Global bounding box

### getLocalBBox

Gets the local bounding box (includes only local transformations).

```typescript
function getLocalBBox(renderable: Renderable, out?: BBox): BBox;
```

**Parameters:**

- `renderable` - The renderable to analyze
- `out` - Optional output BBox to reuse

**Returns:** Local bounding box

### getNaturalBBox

Gets the natural bounding box (no transformations applied).

```typescript
function getNaturalBBox(renderable: Renderable, out?: BBox): BBox;
```

**Parameters:**

- `renderable` - The renderable to analyze
- `out` - Optional output BBox to reuse

**Returns:** Natural bounding box

### BBox Class

Oriented bounding box with corner points and AABB properties.

```typescript
class BBox implements AABB {
  // Corner points (Vec2)
  a: Vec2; // Top-left
  b: Vec2; // Top-right
  c: Vec2; // Bottom-right
  d: Vec2; // Bottom-left

  // AABB bounds
  min: Vec2; // Top-left corner
  max: Vec2; // Bottom-right corner
  center: Vec2; // Center point

  // Dimensions
  width: number;
  height: number;

  constructor();

  // Operations
  reset(): BBox;
  merge(other: AABB): BBox;
  fit(x1: number, y1: number, x2?: number, y2?: number): BBox;
  transform(matrix: Matrix3): BBox;
  copy(other: BBox): BBox;
}
```

### AABB Interface

Axis-aligned bounding box interface.

```typescript
interface AABB {
  min: Vec2;
  max: Vec2;
}
```

## Geometry Analysis

### getCenter

Gets the global center point of a renderable.

```typescript
function getCenter(renderable: Renderable, out?: Vec2): Vec2;
```

**Parameters:**

- `renderable` - The renderable to analyze
- `out` - Optional output Vec2 to reuse

**Returns:** Global center point

### getLocalTransform

Gets the local transformation matrix.

```typescript
function getLocalTransform(renderable: Renderable, out?: Matrix3): Matrix3;
```

**Parameters:**

- `renderable` - The renderable to analyze
- `out` - Optional output Matrix3 to reuse

**Returns:** Local transformation matrix

## Curve Sampling

### getPoints

Gets sampled points for a renderable (with global transforms).

```typescript
function getPoints(renderable: Renderable, out?: Vec2[]): Vec2[];
```

**Parameters:**

- `renderable` - The renderable to sample
- `out` - Optional output array to reuse

**Returns:** Array of sampled points

### getLocalPoints

Gets sampled points for a renderable (with local transforms only).

```typescript
function getLocalPoints(renderable: Renderable, out?: Vec2[]): Vec2[];
```

**Parameters:**

- `renderable` - The renderable to sample
- `out` - Optional output array to reuse

**Returns:** Array of locally transformed points

### getNaturalPoints

Gets sampled points for a renderable (no transforms).

```typescript
function getNaturalPoints(renderable: Renderable, out?: Vec2[]): Vec2[];
```

**Parameters:**

- `renderable` - The renderable to sample
- `out` - Optional output array to reuse

**Returns:** Array of natural points

### Bezier Sampling

#### Bezier3 (Cubic Bezier)

```typescript
class Bezier3 {
  // Sample point at parameter t (0-1)
  static sample(
    px: number,
    py: number, // Start point
    cp1x: number,
    cp1y: number, // Control point 1
    cp2x: number,
    cp2y: number, // Control point 2
    x: number,
    y: number, // End point
    t: number, // Parameter (0-1)
    out?: Vec2 // Output point
  ): Vec2;

  // Get bounding box
  static aabb(bezier3: BezierCurveTo, previous: Segment, out?: BBox): BBox;

  // Adaptive sampling with quality control
  static adaptiveSample(
    bezier3: BezierCurveTo,
    previous: Segment,
    quality: number,
    out?: Vec2[]
  ): Vec2[];

  // Recursive subdivision sampling
  static subdivision(
    a: Vec2,
    b: Vec2,
    c: Vec2,
    d: Vec2, // Control points
    tolerance2: number, // Squared tolerance
    out: Vec2[] // Output array
  ): Vec2[];
}
```

#### Bezier2 (Quadratic Bezier)

```typescript
class Bezier2 {
  // Sample point at parameter t (0-1)
  static sample(
    px: number,
    py: number, // Start point
    cpx: number,
    cpy: number, // Control point
    x: number,
    y: number, // End point
    t: number, // Parameter (0-1)
    out?: Vec2 // Output point
  ): Vec2;

  // Get bounding box
  static aabb(bezier2: QuadraticCurveTo, previous: Segment, out?: BBox): BBox;

  // Adaptive sampling
  static adaptiveSample(
    bezier2: QuadraticCurveTo,
    previous: Segment,
    quality: number,
    out?: Vec2[]
  ): Vec2[];
}
```

#### Elliptic

```typescript
interface EllipticParams {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation?: number;
  startAngle: number;
  endAngle: number;
  counterclockwise?: boolean;
}

class Elliptic {
  // Sample point at parameter t (0-1)
  static sample(params: EllipticParams, t: number, out?: Vec2): Vec2;

  // Adaptive sampling
  static adaptiveSample(
    params: EllipticParams,
    quality: number,
    out?: Vec2[]
  ): Vec2[];
}
```

### Box Sampling

```typescript
class Box {
  // Sample rectangle points
  static sample(
    x: number,
    y: number,
    width: number,
    height: number,
    out?: Vec2[]
  ): Vec2[];

  // Sample rectangle from Rect object
  static sampleRect(rect: Rect, out?: Vec2[]): Vec2[];

  // Sample rounded rectangle
  static sampleRoundRect(
    roundRect: RoundRect,
    quality: number,
    out?: Vec2[]
  ): Vec2[];

  // Sample AABB
  static sampleAABB(aabb: AABB, out?: Vec2[]): Vec2[];

  // Sample BBox (oriented)
  static sampleBBox(bbox: BBox, out?: Vec2[]): Vec2[];
}
```

## AABB Operations

### aabbContains

Tests if an AABB contains a point or another AABB.

```typescript
function aabbContains(container: AABB, target: AABB | Vec2): boolean;
```

### aabbOverlaps

Tests if two AABBs overlap.

```typescript
function aabbOverlaps(a: AABB, b: AABB): boolean;
```

## Path Analysis

### getPathBBox

Gets bounding box for a path.

```typescript
function getPathBBox(path: Path, out?: BBox): BBox;
```

**Parameters:**

- `path` - Path to analyze
- `out` - Optional output BBox

**Returns:** Bounding box of the path

### getPathPoints

Gets sampled points for a path.

```typescript
function getPathPoints(path: Path, out?: Vec2[]): Vec2[];
```

**Parameters:**

- `path` - Path to sample
- `out` - Optional output array

**Returns:** Array of sampled points

## Polygon Operations

### isPointInPolygon

Tests if a point is inside a polygon.

```typescript
function isPointInPolygon(polygon: Vec2[], point: Vec2): boolean;
```

### doPolygonsOverlap

Tests if two polygons overlap using SAT (Separating Axis Theorem).

```typescript
function doPolygonsOverlap(a: Vec2[], b: Vec2[]): boolean;
```

### isPointInPolyline

Tests if a point is within a stroke distance of a polyline.

```typescript
function isPointInPolyline(
  polyline: Vec2[],
  lineWidth: number,
  point: Vec2
): boolean;
```

### doPolylinesOverlap

Tests if two polylines with stroke width overlap.

```typescript
function doPolylinesOverlap(
  a: Vec2[],
  aWidth: number,
  b: Vec2[],
  bWidth: number
): boolean;
```

## Performance Notes

1. **Caching**: All bound calculations are automatically cached and invalidated when shapes change
2. **Reuse Objects**: Pass output parameters (`out`) to reuse Vec2/BBox instances and reduce garbage collection
3. **Hierarchy**: AABB tests are faster than detailed overlap tests - use them for broad-phase collision detection
4. **Quality**: Higher quality values for adaptive sampling produce more points but are more accurate
