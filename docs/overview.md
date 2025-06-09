# ShapeKit Documentation

ShapeKit is a powerful TypeScript library that simplifies working with the Canvas2D API while providing advanced tools for geometry manipulation and analysis. It offers a declarative approach to creating 2D graphics with built-in support for transformations, hit-testing, and complex shape operations.

## Key Features

- **Declarative Canvas2D API**: Create complex 2D scenes using simple, reusable components
- **Advanced Geometry Tools**: Precise bounding box calculations, hit-testing, and overlap detection
- **Shape Transformations**: Powerful transformation system for manipulating multiple shapes
- **Performance Optimized**: Efficient rendering and calculation algorithms
- **TypeScript First**: Full type safety and excellent developer experience

## Architecture

ShapeKit is organized into three main modules:

### Core Module (`shapekit`)

The foundation of the library, providing:

- **Renderables**: `Shape`, `Group`, `Text`, `Image`, `Clip` components
- **Path System**: Canvas2D path commands as composable functions
- **Styles**: Gradients, patterns, and styling options
- **Canvas2D Renderer**: Efficient rendering to HTML5 Canvas

### Bounds Module (`shapekit/bounds`)

Geometry analysis tools including:

- **Bounding Boxes**: AABB, OBB, and tight bounding calculations
- **Hit Testing**: Point-in-shape and shape containment detection
- **Overlap Detection**: Collision detection between shapes
- **Curve Sampling**: Adaptive sampling of bezier curves and paths

### Transforms Module (`shapekit/transforms`)

Advanced shape manipulation:

- **Transformer Class**: Multi-shape transformation with unified controls
- **Interactive Handles**: Drag, resize, and rotate operations
- **Snapshotting**: Undo/redo functionality for transformations

## Installation

```bash
npm install shapekit
```

## Quick Start

```typescript
import { Canvas2D, Group, Shape, rect } from "shapekit";

// Create a scene
const scene = new Group({
  children: [
    new Shape({
      x: 100,
      y: 100,
      fill: "red",
      path: [rect(0, 0, 50, 50)],
    }),
  ],
});

// Create renderer
const canvas = new Canvas2D(scene, { width: 400, height: 300 });

// Add to DOM and start rendering
document.body.appendChild(canvas.element);

// Animation loop
function animate() {
  scene.rotation += 0.01;
  canvas.update();
  requestAnimationFrame(animate);
}
animate();
```

For advanced control of loop timing behavior, please see `https://gitlab.com/jfalxa/vroum`.

## Module Guides

- [**Core Module Guide**](./core.md) - Learn about renderables, paths, and styling
- [**Bounds Module Guide**](./bounds.md) - Master geometry analysis and hit-testing
- [**Transforms Module Guide**](./transforms.md) - Build interactive transformation tools
- [**Examples & Tutorials**](./examples.md) - Common use cases and patterns

## API Reference

Each module provides comprehensive TypeScript definitions. Import what you need:

```typescript
// Core rendering
import { Canvas2D, Shape, Group, Text } from "shapekit";

// Geometry analysis
import { contains, overlaps, getBBox } from "shapekit/bounds";

// Transformations
import { Transformer } from "shapekit/transforms";
```

## Browser Support

ShapeKit works in all modern browsers that support:

- Canvas2D API
- ES2015+ features
- TypeScript (for development)

No dependencies required - ShapeKit is a standalone library.
