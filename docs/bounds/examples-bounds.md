# Bounds Module Guide

The bounds module (`shapekit/bounds`) provides powerful geometry analysis tools for hit-testing, collision detection, bounding box calculations, and curve sampling. These tools are essential for building interactive applications with precise spatial relationships.

## Table of Contents

- [Hit Testing](#hit-testing)
- [Collision Detection](#collision-detection)
- [Bounding Boxes](#bounding-boxes)
- [Curve Sampling](#curve-sampling)
- [Advanced Analysis](#advanced-analysis)

## Hit Testing

Hit testing determines if a point is inside a shape or if one shape contains another.

### Point-in-Shape Testing

```typescript
import { contains } from "shapekit/bounds";
import { Shape, rect } from "shapekit";

const rectangle = new Shape({
  x: 100,
  y: 100,
  path: [rect(0, 0, 50, 50)]
});

// Test if point is inside shape
const point = { x: 125, y: 125 };
if (contains(rectangle, point)) {
  console.log("Point is inside rectangle");
}

// Works with mouse events
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickPoint = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  
  if (contains(shape, clickPoint)) {
    console.log("Shape clicked!");
  }
});
```

### Shape Containment

```typescript
import { contains } from "shapekit/bounds";

const container = new Shape({
  x: 100,
  y: 100,
  path: [rect(0, 0, 200, 200)]
});

const inner = new Shape({
  x: 150,
  y: 150,
  path: [rect(0, 0, 50, 50)]
});

if (contains(container, inner)) {
  console.log("Inner shape is completely inside container");
}
```

### Group Hit Testing

Groups automatically test their children:

```typescript
import { Group, Shape, contains, walk } from "shapekit";

const group = new Group({
  children: [/* multiple shapes */]
});

// Find which specific child was clicked
const clickedShape = walk(group, (renderable) => {
  if (contains(renderable, clickPoint)) {
    return renderable; // Return to stop traversal
  }
});
```

## Collision Detection

Detect when shapes overlap or intersect.

### Basic Overlap Detection

```typescript
import { overlaps } from "shapekit/bounds";

const shape1 = new Shape({
  x: 100,
  y: 100,
  path: [rect(0, 0, 50, 50)]
});

const shape2 = new Shape({
  x: 125,
  y: 125,
  path: [rect(0, 0, 50, 50)]
});

if (overlaps(shape1, shape2)) {
  console.log("Shapes are overlapping!");
}
```

### Collision Response

```typescript
// Game loop collision detection
function checkCollisions(entities) {
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      if (overlaps(entities[i], entities[j])) {
        handleCollision(entities[i], entities[j]);
      }
    }
  }
}

function handleCollision(a, b) {
  // Separate overlapping objects
  const distance = Vec2.distance(getCenter(a), getCenter(b));
  const minDistance = (getBBox(a).width + getBBox(b).width) / 2;
  const separation = minDistance - distance;
  
  // Apply separation logic...
}
```

### Broad Phase Optimization

```typescript
import { getBBox, overlaps } from "shapekit/bounds";

// First check bounding boxes (fast)
function quickOverlap(a, b) {
  const bboxA = getBBox(a);
  const bboxB = getBBox(b);
  
  // Quick AABB test
  if (!aabbOverlaps(bboxA, bboxB)) {
    return false;
  }
  
  // Detailed overlap test only if needed
  return overlaps(a, b);
}
```

## Bounding Boxes

Calculate precise bounding boxes for any renderable.

### Types of Bounding Boxes

```typescript
import { 
  getBBox,        // Global bounding box (with transforms)
  getLocalBBox,   // Local bounding box (with local transforms only)
  getNaturalBBox  // Natural bounding box (without transforms)
} from "shapekit/bounds";

const shape = new Shape({
  x: 100,
  y: 100,
  rotation: Math.PI / 4,
  path: [rect(0, 0, 50, 50)]
});

// Global bounding box (includes all transformations)
const globalBBox = getBBox(shape);
console.log(`Global bounds: ${globalBBox.width} x ${globalBBox.height}`);

// Natural bounding box (just the path)
const naturalBBox = getNaturalBBox(shape);
console.log(`Natural bounds: ${naturalBBox.width} x ${naturalBBox.height}`);
```

### BBox Properties

```typescript
const bbox = getBBox(shape);

// Corner points (Vec2 instances)
console.log("Corners:", bbox.a, bbox.b, bbox.c, bbox.d);

// AABB properties
console.log("Min:", bbox.min);    // Top-left corner
console.log("Max:", bbox.max);    // Bottom-right corner
console.log("Center:", bbox.center);

// Dimensions
console.log("Size:", bbox.width, "x", bbox.height);
```

### Working with BBoxes

```typescript
import { BBox } from "shapekit/bounds";

// Create empty bounding box
const bbox = new BBox();

// Fit points
bbox.fit(10, 10, 50, 50);

// Merge with another bbox
const other = getBBox(someShape);
bbox.merge(other);

// Transform bbox
bbox.transform(someMatrix);

// Reset for reuse
bbox.reset();
```

### Group Bounding Boxes

```typescript
// Groups automatically calculate combined bounds
const group = new Group({
  children: [shape1, shape2, shape3]
});

const groupBounds = getBBox(group); // Encompasses all children
```

## Curve Sampling

Convert curves and complex paths into point arrays for detailed analysis.

### Adaptive Curve Sampling

```typescript
import { getPoints, getLocalPoints, getNaturalPoints } from "shapekit/bounds";

const curve = new Shape({
  path: [
    moveTo(0, 0),
    bezierCurveTo(25, -50, 75, -50, 100, 0),
    quadraticCurveTo(150, 50, 200, 0)
  ]
});

// Get sampled points (Vec2 array)
const points = getPoints(curve);
console.log(`Curve approximated with ${points.length} points`);

// Use points for custom analysis
points.forEach((point, i) => {
  console.log(`Point ${i}: (${point.x}, ${point.y})`);
});
```

### Quality Control

Sampling quality is automatically determined but can be influenced:

```typescript
// More complex paths = more sample points
const detailedPath = new Shape({
  path: [
    moveTo(0, 0),
    bezierCurveTo(10, -20, 30, -20, 40, 0),
    bezierCurveTo(50, 20, 70, 20, 80, 0),
    bezierCurveTo(90, -20, 110, -20, 120, 0)
  ]
});

const points = getPoints(detailedPath);
// Automatically gets more points for the complex curves
```

### Manual Sampling

For custom sampling needs:

```typescript
import { Bezier3, Bezier2, Elliptic } from "shapekit/bounds";

// Sample bezier curve manually
const points = [];
Bezier3.adaptiveSample(
  bezierSegment,
  previousSegment,
  quality,      // Higher = more points
  points        // Output array
);

// Sample ellipse arc
Elliptic.adaptiveSample({
  x: 0, y: 0,
  radiusX: 50, radiusY: 30,
  startAngle: 0,
  endAngle: Math.PI
}, quality, points);
```

## Advanced Analysis

### Path Hull Approximation

```typescript
// Get the convex hull of a path
function getConvexHull(shape) {
  const points = getPoints(shape);
  return convexHull(points); // Implement your preferred algorithm
}

// Use for collision optimization
function roughCollisionCheck(a, b) {
  const hullA = getConvexHull(a);
  const hullB = getConvexHull(b);
  return doPolygonsOverlap(hullA, hullB);
}
```

### Distance Calculations

```typescript
import { Vec2 } from "shapekit";

function getDistance(shape1, shape2) {
  const center1 = getCenter(shape1);
  const center2 = getCenter(shape2);
  return Vec2.distance(center1, center2);
}

function getClosestPoint(shape, targetPoint) {
  const points = getPoints(shape);
  let closest = points[0];
  let minDistance = Vec2.distance(closest, targetPoint);
  
  for (let i = 1; i < points.length; i++) {
    const distance = Vec2.distance(points[i], targetPoint);
    if (distance < minDistance) {
      minDistance = distance;
      closest = points[i];
    }
  }
  
  return closest;
}
```

### Spatial Partitioning

```typescript
// Use bounding boxes for spatial partitioning
class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }
  
  insert(shape) {
    const bbox = getBBox(shape);
    const cells = this.getCells(bbox);
    
    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, []);
      }
      this.grid.get(cell).push(shape);
    });
  }
  
  query(bbox) {
    const cells = this.getCells(bbox);
    const candidates = new Set();
    
    cells.forEach(cell => {
      const shapes = this.grid.get(cell) || [];
      shapes.forEach(shape => candidates.add(shape));
    });
    
    return Array.from(candidates);
  }
  
  getCells(bbox) {
    const cells = [];
    const startX = Math.floor(bbox.min.x / this.cellSize);
    const endX = Math.floor(bbox.max.x / this.cellSize);
    const startY = Math.floor(bbox.min.y / this.cellSize);
    const endY = Math.floor(bbox.max.y / this.cellSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    
    return cells;
  }
}
```

### Performance Tips

1. **Cache Results**: Bounding calculations are cached automatically, but store results if doing repeated queries
2. **Use Hierarchy**: Test broader shapes before detailed ones
3. **Early Exit**: Use AABB tests before expensive polygon operations
4. **Spatial Partitioning**: For many objects, use spatial data structures

```typescript
// Efficient collision detection for many objects
class CollisionSystem {
  constructor() {
    this.spatialGrid = new SpatialGrid(100);
  }
  
  checkCollisions(shapes) {
    // Clear and rebuild grid
    this.spatialGrid.clear();
    shapes.forEach(shape => this.spatialGrid.insert(shape));
    
    const collisions = [];
    
    shapes.forEach(shape => {
      const bbox = getBBox(shape);
      const candidates = this.spatialGrid.query(bbox);
      
      candidates.forEach(other => {
        if (shape !== other && overlaps(shape, other)) {
          collisions.push([shape, other]);
        }
      });
    });
    
    return collisions;
  }
}
```

The bounds module provides the foundation for building sophisticated interactive applications with precise spatial awareness. Combine these tools with the [Transforms Module](./transforms.md) for complete interactive shape manipulation systems.