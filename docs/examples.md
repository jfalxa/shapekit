# Examples & Getting Started

This guide provides practical examples and common patterns for using ShapeKit in real applications. From basic rendering to complex interactive systems, these examples will help you get started quickly.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Basic Examples](#basic-examples)
- [Interactive Applications](#interactive-applications)
- [Animation & Effects](#animation--effects)
- [Common Patterns](#common-patterns)
- [Real-world Applications](#real-world-applications)

## Installation & Setup

### Package Installation

```bash
npm install shapekit
```

### Basic HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>ShapeKit App</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        canvas { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="main.js"></script>
</body>
</html>
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Basic Examples

### Hello World

```typescript
import { Canvas2D, Group, Shape, Text, rect } from "shapekit";

// Create a simple scene
const scene = new Group({
  children: [
    new Text({
      x: 50,
      y: 50,
      text: "Hello, ShapeKit!",
      textFill: "blue",
      fontSize: 24
    }),
    new Shape({
      x: 50,
      y: 100,
      fill: "red",
      stroke: "black",
      lineWidth: 2,
      path: [rect(0, 0, 100, 60)]
    })
  ]
});

// Create canvas and render
const canvas = new Canvas2D(scene, { width: 400, height: 300 });
document.getElementById("app").appendChild(canvas.element);
canvas.update();
```

### Drawing Basic Shapes

```typescript
import { 
  Canvas2D, Group, Shape, 
  rect, roundRect, arc, ellipse, 
  moveTo, lineTo, bezierCurveTo, closePath 
} from "shapekit";

const shapes = new Group({
  children: [
    // Rectangle
    new Shape({
      x: 50, y: 50,
      fill: "lightblue",
      stroke: "navy",
      path: [rect(0, 0, 80, 60)]
    }),
    
    // Rounded rectangle
    new Shape({
      x: 150, y: 50,
      fill: "lightgreen",
      stroke: "darkgreen",
      path: [roundRect(0, 0, 80, 60, 10)]
    }),
    
    // Circle
    new Shape({
      x: 250, y: 80,
      fill: "pink",
      stroke: "red",
      path: [arc(0, 0, 30, 0, Math.PI * 2)]
    }),
    
    // Ellipse
    new Shape({
      x: 350, y: 80,
      fill: "lightyellow",
      stroke: "orange",
      path: [ellipse(0, 0, 40, 25)]
    }),
    
    // Custom path (star)
    new Shape({
      x: 150, y: 200,
      fill: "gold",
      stroke: "darkorange",
      lineWidth: 2,
      path: [
        moveTo(0, -30),
        lineTo(8, -8),
        lineTo(30, -6),
        lineTo(12, 8),
        lineTo(18, 30),
        lineTo(0, 18),
        lineTo(-18, 30),
        lineTo(-12, 8),
        lineTo(-30, -6),
        lineTo(-8, -8),
        closePath()
      ]
    })
  ]
});

const canvas = new Canvas2D(shapes, { width: 500, height: 350 });
document.body.appendChild(canvas.element);
canvas.update();
```

### Smooth Bezier Curves

ShapeKit supports SVG-style smooth bezier curves for creating flowing paths:

```typescript
import { 
  Canvas2D, Group, Shape, 
  moveTo, bezierCurveTo, quadraticCurveTo 
} from "shapekit";

const smoothCurves = new Group({
  children: [
    // Smooth cubic bezier path
    new Shape({
      x: 50, y: 50,
      stroke: "blue",
      lineWidth: 3,
      fill: "none",
      path: [
        moveTo(0, 50),
        // Start with regular bezier
        bezierCurveTo(25, 0, 75, 0, 100, 50),
        // Smooth continuation - first control computed automatically
        bezierCurveTo(175, 100, 200, 50),
        // Another smooth curve
        bezierCurveTo(275, 0, 300, 50)
      ]
    }),
    
    // Smooth quadratic bezier path
    new Shape({
      x: 50, y: 150,
      stroke: "red", 
      lineWidth: 3,
      fill: "none",
      path: [
        moveTo(0, 25),
        // Start with regular quadratic
        quadraticCurveTo(50, 0, 100, 25),
        // Smooth continuation - control point computed automatically
        quadraticCurveTo(200, 25), // Only specify end point
        quadraticCurveTo(300, 25)
      ]
    })
  ]
});

const canvas = new Canvas2D(smoothCurves, { width: 400, height: 250 });
document.body.appendChild(canvas.element);
canvas.update();
```

### Working with Gradients

```typescript
import { Canvas2D, Shape, rect, linearGradient, radialGradient } from "shapekit";

const gradientShapes = new Group({
  children: [
    // Linear gradient
    new Shape({
      x: 50, y: 50,
      fill: linearGradient(0, 0, 100, 0, {
        0: "red",
        50: "yellow",
        100: "blue"
      }),
      path: [rect(0, 0, 100, 60)]
    }),
    
    // Radial gradient
    new Shape({
      x: 200, y: 50,
      fill: radialGradient(50, 30, 0, 50, 30, 40, {
        0: "white",
        100: "black"
      }),
      path: [rect(0, 0, 100, 60)]
    })
  ]
});

const canvas = new Canvas2D(gradientShapes, { width: 400, height: 200 });
document.body.appendChild(canvas.element);
canvas.update();
```

## Interactive Applications

### Click Detection

```typescript
import { Canvas2D, Group, Shape, contains, walk } from "shapekit";
import { rect } from "shapekit";

class ClickableShapes {
  constructor() {
    this.scene = new Group({
      children: [
        new Shape({
          id: "red-box",
          x: 50, y: 50,
          fill: "red",
          path: [rect(0, 0, 80, 60)]
        }),
        new Shape({
          id: "blue-circle",
          x: 200, y: 80,
          fill: "blue",
          path: [arc(0, 0, 40, 0, Math.PI * 2)]
        })
      ]
    });
    
    this.canvas = new Canvas2D(this.scene, { width: 400, height: 300 });
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("click", (event) => {
      const rect = this.canvas.element.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      const clicked = walk(this.scene, (shape) => {
        if (contains(shape, point)) {
          return shape; // Return to stop traversal
        }
      });
      
      if (clicked) {
        this.onShapeClicked(clicked);
      }
    });
  }
  
  onShapeClicked(shape) {
    console.log(`Clicked: ${shape.id}`);
    
    // Visual feedback
    const originalFill = shape.fill;
    shape.fill = "yellow";
    this.canvas.update();
    
    setTimeout(() => {
      shape.fill = originalFill;
      this.canvas.update();
    }, 200);
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
    this.canvas.update();
  }
}

new ClickableShapes().mount();
```

### Drag and Drop

```typescript
import { Canvas2D, Group, Shape, contains } from "shapekit";
import { Transformer } from "shapekit/transforms";

class DragDropSystem {
  constructor() {
    this.scene = new Group();
    this.canvas = new Canvas2D(this.scene, { width: 800, height: 600 });
    this.transformer = new Transformer();
    
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    
    this.createShapes();
    this.setupEventListeners();
  }
  
  createShapes() {
    for (let i = 0; i < 5; i++) {
      this.scene.add(new Shape({
        id: `shape-${i}`,
        x: 100 + i * 120,
        y: 100,
        fill: `hsl(${i * 72}, 70%, 60%)`,
        stroke: "black",
        lineWidth: 2,
        path: [rect(0, 0, 60, 60)]
      }));
    }
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.element.addEventListener("mouseup", this.onMouseUp.bind(this));
  }
  
  getMousePos(event) {
    const rect = this.canvas.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  onMouseDown(event) {
    const pos = this.getMousePos(event);
    
    const clicked = walk(this.scene, (shape) => {
      if (contains(shape, pos)) return shape;
    });
    
    if (clicked) {
      this.transformer.select(clicked);
      this.isDragging = true;
      this.dragStart = pos;
      this.canvas.element.style.cursor = "grabbing";
    }
  }
  
  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const pos = this.getMousePos(event);
    const delta = {
      x: pos.x - this.dragStart.x,
      y: pos.y - this.dragStart.y
    };
    
    this.transformer.translate(delta);
    this.transformer.apply();
    this.canvas.update();
    
    this.dragStart = pos;
  }
  
  onMouseUp(event) {
    if (this.isDragging) {
      this.transformer.commit();
      this.isDragging = false;
      this.canvas.element.style.cursor = "default";
    }
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
    this.canvas.update();
  }
}

new DragDropSystem().mount();
```

### Selection Tool

```typescript
import { Canvas2D, Group, Shape, overlaps, getBBox } from "shapekit";

class SelectionTool {
  constructor() {
    this.scene = new Group();
    this.canvas = new Canvas2D(this.scene, { width: 800, height: 600 });
    this.selected = new Set();
    
    this.selectionBox = new Shape({
      stroke: "blue",
      fill: "rgba(0, 100, 255, 0.1)",
      lineWidth: 1,
      lineDash: [5, 5],
      path: [rect(0, 0, 0, 0)],
      hidden: true
    });
    
    this.isSelecting = false;
    this.selectionStart = { x: 0, y: 0 };
    
    this.createShapes();
    this.setupEventListeners();
  }
  
  createShapes() {
    this.scene.add(this.selectionBox);
    
    // Create random shapes
    for (let i = 0; i < 20; i++) {
      this.scene.add(new Shape({
        id: `shape-${i}`,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
        stroke: "black",
        lineWidth: 1,
        path: [rect(0, 0, 40, 30)]
      }));
    }
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.element.addEventListener("mouseup", this.onMouseUp.bind(this));
  }
  
  getMousePos(event) {
    const rect = this.canvas.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  onMouseDown(event) {
    const pos = this.getMousePos(event);
    
    this.isSelecting = true;
    this.selectionStart = pos;
    
    // Clear previous selection
    this.clearSelection();
    
    // Show selection box
    this.selectionBox.hidden = false;
    this.updateSelectionBox(pos);
  }
  
  onMouseMove(event) {
    if (!this.isSelecting) return;
    
    const pos = this.getMousePos(event);
    this.updateSelectionBox(pos);
    this.updateSelection();
    this.canvas.update();
  }
  
  onMouseUp(event) {
    if (this.isSelecting) {
      this.isSelecting = false;
      this.selectionBox.hidden = true;
      this.canvas.update();
    }
  }
  
  updateSelectionBox(currentPos) {
    const { selectionStart } = this;
    const x = Math.min(selectionStart.x, currentPos.x);
    const y = Math.min(selectionStart.y, currentPos.y);
    const width = Math.abs(currentPos.x - selectionStart.x);
    const height = Math.abs(currentPos.y - selectionStart.y);
    
    this.selectionBox.x = x;
    this.selectionBox.y = y;
    this.selectionBox.path = [rect(0, 0, width, height)];
  }
  
  updateSelection() {
    this.clearSelection();
    
    const selectionBBox = getBBox(this.selectionBox);
    
    this.scene.children.forEach(shape => {
      if (shape === this.selectionBox) return;
      
      if (overlaps(shape, selectionBBox)) {
        this.selected.add(shape);
        shape.stroke = "red";
        shape.lineWidth = 3;
      }
    });
  }
  
  clearSelection() {
    this.selected.forEach(shape => {
      shape.stroke = "black";
      shape.lineWidth = 1;
    });
    this.selected.clear();
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
    this.canvas.update();
  }
}

new SelectionTool().mount();
```

## Animation & Effects

### Basic Animation

```typescript
import { Canvas2D, Group, Shape, rect } from "shapekit";

class AnimationExample {
  constructor() {
    this.scene = new Group({
      children: [
        new Shape({
          id: "rotating-square",
          x: 200,
          y: 150,
          fill: "red",
          path: [rect(-25, -25, 50, 50)]
        }),
        new Shape({
          id: "bouncing-circle",
          x: 100,
          y: 100,
          fill: "blue",
          path: [arc(0, 0, 20, 0, Math.PI * 2)]
        })
      ]
    });
    
    this.canvas = new Canvas2D(this.scene, { width: 400, height: 300 });
    this.animationTime = 0;
    
    this.animate();
  }
  
  animate() {
    this.animationTime += 0.016; // ~60fps
    
    // Rotate square
    const square = this.scene.children.find(s => s.id === "rotating-square");
    square.rotation = this.animationTime;
    
    // Bounce circle
    const circle = this.scene.children.find(s => s.id === "bouncing-circle");
    circle.y = 150 + Math.sin(this.animationTime * 3) * 50;
    
    this.canvas.update();
    requestAnimationFrame(() => this.animate());
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
  }
}

new AnimationExample().mount();
```

### Particle System

```typescript
class Particle {
  constructor(x, y) {
    this.shape = new Shape({
      x, y,
      fill: `hsl(${Math.random() * 60 + 20}, 100%, 50%)`,
      path: [arc(0, 0, Math.random() * 3 + 2, 0, Math.PI * 2)]
    });
    
    this.velocity = {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4
    };
    
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.01;
  }
  
  update() {
    this.shape.x += this.velocity.x;
    this.shape.y += this.velocity.y;
    
    this.life -= this.decay;
    this.shape.globalAlpha = this.life;
    
    return this.life > 0;
  }
}

class ParticleSystem {
  constructor() {
    this.scene = new Group();
    this.canvas = new Canvas2D(this.scene, { width: 800, height: 600 });
    this.particles = [];
    
    this.setupEventListeners();
    this.animate();
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("click", (event) => {
      const rect = this.canvas.element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.createBurst(x, y);
    });
  }
  
  createBurst(x, y) {
    for (let i = 0; i < 20; i++) {
      const particle = new Particle(x, y);
      this.particles.push(particle);
      this.scene.add(particle.shape);
    }
  }
  
  animate() {
    // Update particles
    this.particles = this.particles.filter(particle => {
      const alive = particle.update();
      if (!alive) {
        this.scene.remove(particle.shape);
      }
      return alive;
    });
    
    this.canvas.update();
    requestAnimationFrame(() => this.animate());
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
    
    // Instructions
    const instructions = document.createElement("p");
    instructions.textContent = "Click to create particle bursts!";
    document.body.appendChild(instructions);
  }
}

new ParticleSystem().mount();
```

## Common Patterns

### Component-Based Architecture

```typescript
// Base component class
class Component {
  constructor(props = {}) {
    this.props = props;
    this.element = this.render();
  }
  
  render() {
    throw new Error("Components must implement render()");
  }
  
  update(newProps) {
    this.props = { ...this.props, ...newProps };
    // Update visual representation
    this.updateElement();
  }
  
  updateElement() {
    // Override in subclasses
  }
}

// Button component
class Button extends Component {
  render() {
    return new Group({
      children: [
        new Shape({
          fill: this.props.color || "lightblue",
          stroke: "black",
          path: [roundRect(0, 0, this.props.width || 100, this.props.height || 40, 5)]
        }),
        new Text({
          x: (this.props.width || 100) / 2,
          y: (this.props.height || 40) / 2,
          text: this.props.text || "Button",
          textAlign: "center",
          textFill: "black"
        })
      ]
    });
  }
  
  updateElement() {
    const [background, text] = this.element.children;
    background.fill = this.props.color || "lightblue";
    text.text = this.props.text || "Button";
  }
}

// Usage
const scene = new Group();
const button = new Button({ 
  text: "Click Me", 
  color: "lightgreen",
  width: 120,
  height: 50
});

scene.add(button.element);
```

### State Management

```typescript
class AppState {
  constructor() {
    this.state = {
      selectedTool: "select",
      selectedShapes: new Set(),
      zoom: 1,
      pan: { x: 0, y: 0 }
    };
    
    this.listeners = [];
  }
  
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    this.listeners.forEach(listener => {
      listener(this.state, oldState);
    });
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Usage
const appState = new AppState();

appState.subscribe((newState, oldState) => {
  if (newState.selectedTool !== oldState.selectedTool) {
    updateToolbar(newState.selectedTool);
  }
  
  if (newState.selectedShapes !== oldState.selectedShapes) {
    updateSelection(newState.selectedShapes);
  }
});
```

### Collision Detection System

```typescript
import { overlaps, getBBox } from "shapekit/bounds";

class CollisionSystem {
  constructor() {
    this.staticBodies = [];
    this.dynamicBodies = [];
    this.collisions = [];
  }
  
  addStatic(shape) {
    this.staticBodies.push(shape);
  }
  
  addDynamic(shape) {
    this.dynamicBodies.push(shape);
  }
  
  checkCollisions() {
    this.collisions = [];
    
    // Dynamic vs Static
    for (const dynamic of this.dynamicBodies) {
      for (const static of this.staticBodies) {
        if (overlaps(dynamic, static)) {
          this.collisions.push({ a: dynamic, b: static, type: "static" });
        }
      }
    }
    
    // Dynamic vs Dynamic
    for (let i = 0; i < this.dynamicBodies.length; i++) {
      for (let j = i + 1; j < this.dynamicBodies.length; j++) {
        const a = this.dynamicBodies[i];
        const b = this.dynamicBodies[j];
        
        if (overlaps(a, b)) {
          this.collisions.push({ a, b, type: "dynamic" });
        }
      }
    }
    
    return this.collisions;
  }
  
  resolveCollisions() {
    for (const collision of this.collisions) {
      this.resolveCollision(collision);
    }
  }
  
  resolveCollision({ a, b, type }) {
    if (type === "static") {
      // Simple separation for static collision
      const bboxA = getBBox(a);
      const bboxB = getBBox(b);
      
      const overlapX = Math.min(bboxA.max.x, bboxB.max.x) - Math.max(bboxA.min.x, bboxB.min.x);
      const overlapY = Math.min(bboxA.max.y, bboxB.max.y) - Math.max(bboxA.min.y, bboxB.min.y);
      
      if (overlapX < overlapY) {
        a.x += bboxA.center.x < bboxB.center.x ? -overlapX : overlapX;
      } else {
        a.y += bboxA.center.y < bboxB.center.y ? -overlapY : overlapY;
      }
    }
  }
}
```

## Real-world Applications

### Simple Drawing App

```typescript
class DrawingApp {
  constructor() {
    this.scene = new Group();
    this.canvas = new Canvas2D(this.scene, { width: 800, height: 600 });
    this.currentPath = [];
    this.isDrawing = false;
    this.currentTool = "pen";
    this.currentColor = "black";
    
    this.setupUI();
    this.setupEventListeners();
  }
  
  setupUI() {
    // Create toolbar
    const toolbar = document.createElement("div");
    toolbar.style.cssText = "margin: 10px; padding: 10px; border: 1px solid #ccc;";
    
    // Tool buttons
    ["pen", "eraser", "clear"].forEach(tool => {
      const button = document.createElement("button");
      button.textContent = tool;
      button.onclick = () => this.setTool(tool);
      toolbar.appendChild(button);
    });
    
    // Color picker
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = this.currentColor;
    colorPicker.onchange = (e) => this.currentColor = e.target.value;
    toolbar.appendChild(colorPicker);
    
    document.body.appendChild(toolbar);
    document.body.appendChild(this.canvas.element);
  }
  
  setupEventListeners() {
    this.canvas.element.addEventListener("mousedown", this.startDrawing.bind(this));
    this.canvas.element.addEventListener("mousemove", this.draw.bind(this));
    this.canvas.element.addEventListener("mouseup", this.stopDrawing.bind(this));
  }
  
  getMousePos(event) {
    const rect = this.canvas.element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  startDrawing(event) {
    this.isDrawing = true;
    const pos = this.getMousePos(event);
    this.currentPath = [moveTo(pos.x, pos.y)];
  }
  
  draw(event) {
    if (!this.isDrawing) return;
    
    const pos = this.getMousePos(event);
    this.currentPath.push(lineTo(pos.x, pos.y));
    
    // Update preview
    this.updatePreview();
  }
  
  stopDrawing() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.currentPath.length > 1) {
      this.commitPath();
    }
    
    this.clearPreview();
  }
  
  updatePreview() {
    this.clearPreview();
    
    this.previewShape = new Shape({
      stroke: this.currentColor,
      lineWidth: this.currentTool === "eraser" ? 10 : 2,
      lineCap: "round",
      lineJoin: "round",
      path: [...this.currentPath]
    });
    
    this.scene.add(this.previewShape);
    this.canvas.update();
  }
  
  commitPath() {
    const shape = new Shape({
      stroke: this.currentColor,
      lineWidth: this.currentTool === "eraser" ? 10 : 2,
      lineCap: "round",
      lineJoin: "round",
      globalCompositeOperation: this.currentTool === "eraser" ? "destination-out" : "source-over",
      path: [...this.currentPath]
    });
    
    this.scene.add(shape);
    this.canvas.update();
  }
  
  clearPreview() {
    if (this.previewShape) {
      this.scene.remove(this.previewShape);
      this.previewShape = null;
    }
  }
  
  setTool(tool) {
    this.currentTool = tool;
    
    if (tool === "clear") {
      this.scene.children.length = 0;
      this.canvas.update();
    }
  }
}

new DrawingApp();
```

### Interactive Chart

```typescript
class BarChart {
  constructor(data, options = {}) {
    this.data = data;
    this.options = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 40 },
      barColor: "steelblue",
      ...options
    };
    
    this.scene = new Group();
    this.canvas = new Canvas2D(this.scene, { 
      width: this.options.width, 
      height: this.options.height 
    });
    
    this.render();
    this.setupInteractivity();
  }
  
  render() {
    const { data, options } = this;
    const { width, height, margin } = options;
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length;
    
    // Create bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = margin.left + index * barWidth;
      const y = margin.top + chartHeight - barHeight;
      
      const bar = new Shape({
        id: `bar-${index}`,
        x,
        y,
        fill: options.barColor,
        stroke: "white",
        lineWidth: 1,
        path: [rect(0, 0, barWidth - 2, barHeight)]
      });
      
      this.scene.add(bar);
      
      // Add labels
      const label = new Text({
        x: x + barWidth / 2,
        y: height - margin.bottom + 15,
        text: item.label,
        textAlign: "center",
        fontSize: 12
      });
      
      this.scene.add(label);
      
      // Add value labels
      const valueLabel = new Text({
        x: x + barWidth / 2,
        y: y - 5,
        text: item.value.toString(),
        textAlign: "center",
        fontSize: 10
      });
      
      this.scene.add(valueLabel);
    });
  }
  
  setupInteractivity() {
    this.canvas.element.addEventListener("mousemove", (event) => {
      const rect = this.canvas.element.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      // Find hovered bar
      const hoveredBar = walk(this.scene, (shape) => {
        if (shape.id && shape.id.startsWith("bar-") && contains(shape, point)) {
          return shape;
        }
      });
      
      // Update hover states
      this.scene.children.forEach(child => {
        if (child.id && child.id.startsWith("bar-")) {
          child.fill = child === hoveredBar ? "orange" : this.options.barColor;
        }
      });
      
      this.canvas.update();
    });
  }
  
  mount() {
    document.body.appendChild(this.canvas.element);
    this.canvas.update();
  }
}

// Usage
const data = [
  { label: "A", value: 20 },
  { label: "B", value: 35 },
  { label: "C", value: 15 },
  { label: "D", value: 45 },
  { label: "E", value: 30 }
];

const chart = new BarChart(data);
chart.mount();
```

These examples demonstrate the flexibility and power of ShapeKit for creating both simple graphics and complex interactive applications. Start with the basic examples and gradually work your way up to more complex patterns as you become comfortable with the library.