# ShapeKit

ShapeKit is a library that aims to simplify using the Canvas2D API.
It provides a collection of light abstractions over the different 2D features of Canvas, in the form of classes that provide a declarative way to describe scenes.
It also comes with a set of tools to analyze your 2D shapes, and do operations like computing bounding boxes, hit-testing, and complex transformations.

## Example usage

```ts
import { Canvas2D, Group, Shape, rect } from "shapekit";

const scene = new Group({
  x: 400,
  y: 300,
  children: [
    new Shape({
      x: -100,
      y: 50,
      rotation: Math.PI / 4,
      fill: "red",
      stroke: "black",
      lineWidth: 2,
      path: [rect(0, 0, 100, 50)],
    }),
  ],
});

const canvas = new Canvas2D(scene, {
  width: 800,
  height: 600,
});

// fake function that runs a requestAnimationFrame loop
loop((delta) => {
  scene.rotation += 0.001 * delta;
  canvas.update();
});

document.body.append(canvas.element);
```

## Documentation

Explore the project structure, usage examples, and detailed API references across all modules.

### General information

- [Overview](docs/overview.md)
  A high-level summary of the project's purpose and architecture.

- [Getting Started](docs/examples.md)
  Step-by-step examples to help you jump in quickly.

---

### Module Reference

Each module comes with its own API documentation and practical examples.

#### `core` – Core Functionality

- [API Reference](docs/core/api-core.md)
- [Examples](docs/core/core.md)

#### `bounds` – Boundary Handling

- [API Reference](docs/bounds/api-bounds.md)
- [Examples](docs/bounds/bounds.md)

#### `transforms` – Geometry Transformations

- [API Reference](docs/transforms/api-transforms.md)
- [Examples](docs/transforms/transforms.md)
