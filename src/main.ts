import { Loop } from "vroum";
import { Renderer } from "./renderer/canvas2d";
import { Rect } from "./shapes/rect";
import { Shape } from "./shapes/shape";
import { Path } from "./utils/path";

function rand(min: number = 0, max: number = 1) {
  return min + Math.random() * (max - min);
}

class App extends Loop {
  canvas = document.getElementById("app") as HTMLCanvasElement;
  renderer = new Renderer(this.canvas, this);

  rect1 = new Rect({
    x: 400,
    y: 450,
    width: 100,
    height: 50,
    fill: "green",
    shadowBlur: 1,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowColor: "#ccc",
  });

  // rect2 = new Rect({
  //   x: 500,
  //   y: 300,
  //   width: 100,
  //   height: 50,
  //   fill: "red",
  //   stroke: "orange",
  // });

  // path = new Shape({
  //   x: 300,
  //   y: 200,
  //   stroke: "blue",
  //   lineWidth: 50,
  //   lineCap: "round",
  //   path: new Path()
  //     .moveTo(10, 80)
  //     .cubicBezierTo(95, 80, 40, 10, 65, 10)
  //     .cubicBezierTo(180, 80, 150, 150),
  // });

  // path3 = new Shape({
  //   x: 300,
  //   y: 200,
  //   stroke: "yellow",
  //   // lineCap: "round",
  //   path: new Path()
  //     .moveTo(10, 80)
  //     .cubicBezierTo(95, 80, 40, 10, 65, 10)
  //     .cubicBezierTo(180, 80, 150, 150),
  // });

  // path2 = new Shape({
  //   x: 300,
  //   y: 200,
  //   stroke: "blue",
  //   lineWidth: 50,
  //   lineCap: "round",
  //   path: new Path()
  //     .moveTo(10, 80)
  //     .quadraticBezierTo(95, 80, 52.5, 10)
  //     .quadraticBezierTo(180, 80),
  // });

  roundRect = new Shape({
    x: 400,
    y: 300,
    stroke: "blue",
    fill: "yellow",
    lineWidth: 3,
    path: new Path().roundedRect(0, 0, 100, 100, 25),
  });

  // circle = new Shape({
  //   x: 400,
  //   y: 300,
  //   stroke: "red",
  //   fill: "yellow",
  //   lineWidth: 5,
  //   lineCap: "square",
  //   path: new Path()
  //     .moveTo(-50, 0)
  //     .arcTo(50, 0, 0, -50, 50)
  //     .arcTo(-50, 0, 0, 50, 50),
  // });

  // roundTriangle = new Shape({
  //   x: 400,
  //   y: 300,
  //   stroke: "red",
  //   fill: "yellow",
  //   lineWidth: 3,
  //   path: new Path()
  //     .moveTo(0, 50)
  //     .arcTo(-50, -50, -100, 50, 10)
  //     .arcTo(50, -50, 0, -150, 10)
  //     .arcTo(0, 50, 100, 50, 10),
  // });

  // line = new Shape({
  //   x: 400,
  //   y: 300,
  //   stroke: "yellow",
  //   lineWidth: 100,
  //   path: new Path()
  //     .moveTo(-50, 0)
  //     .lineTo(50, 0)
  //     .lineTo(50, 100)
  //     .lineTo(100, 150),
  // });

  mount() {
    for (let i = 0; i < 0; i++) {
      this.renderer.add(
        new Rect({
          x: rand(0, 800),
          y: rand(0, 600),
          width: rand(10, 20),
          height: rand(10, 20),
          fill: `rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`,
        })
      );
    }

    // this.renderer.add(this.line);
    this.renderer.add(this.rect1);
    // this.renderer.add(this.rect2);
    // this.renderer.add(this.path);
    // this.renderer.add(this.path2);
    // this.renderer.add(this.path3);
    this.renderer.add(this.roundRect);
    // this.renderer.add(this.roundTriangle);
    // this.renderer.add(this.circle);
  }

  tick() {
    for (const shape of this.renderer.shapes) {
      // if (shape === this.rect1 || shape === this.rect2) continue;
      shape.angle += this.deltaTime * 0.001;
    }
    // if (this.rect1.overlaps(this.rect2)) {
    //   this.rect1.fill = "lime";
    //   this.rect2.fill = "orange";
    // } else {
    //   this.rect1.fill = "green";
    //   this.rect2.fill = "red";
    // }
    // if (this.rect1.overlaps(this.path)) {
    //   this.path.stroke = "red";
    // } else {
    //   this.path.stroke = "blue";
    // }
  }
}

// @ts-ignore
window.app = new App();
