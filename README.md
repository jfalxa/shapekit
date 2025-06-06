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

All renderables can define transformations, using `x`,`y` for translations, `scaleX,scaleY` for scaling, `skewX`,`skewY` for skewing, and `rotation` for rotation.

`Group` acts as a container of renderables, its transformations are applied to all its children.
The transformations describe in the children are always relative to the (0,0) point, in their parent group space.

`Shape` allows you to customize the current canvas context by setting its properties.
Those properties' names match exactly the ones in [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D), except `fillStyle` and `strokeStyle` that become `fill` and `stroke`.

Shapes also have a `path` property, that is an array of path segments, created with helper functions importable from `shapekit`.
Path segments follow the naming and arguments of the [Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) API.

Renderables are only pure data and are not tied directly to a specific rendering target, so `Canvas2D` is a renderer dedicated to the Canvas 2D API.
When creating a new Canvas2D instance, you need to give it a `Group` instance as first argument.
Then, you'll have to call the instance's `.update()` method inside a requestAnimationFrame loop in order to see your changes reflected on screen.
