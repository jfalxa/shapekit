import { Loop } from "vroum";
import { render } from "./render/canvas2d";
import { Shape } from "./shapes/shape";
import treeSrc from "./tree.png";
import { Text } from "./shapes/text";
import { Image } from "./shapes/image";
import { bezier3, move, bezier2, roundedRect, corner, line, arc } from "./path";
import { Group } from "./shapes/group";
import { Renderable } from "./shapes/renderable";

class App extends Loop {
  canvas = document.getElementById("app") as HTMLCanvasElement;
  ctx = this.canvas.getContext("2d")!;

  shapes: Renderable[] = [];

  rect1 = new Shape({
    x: 400,
    y: 300,
    width: 100,
    height: 50,
    fill: "green",
    shadowBlur: 1,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowColor: "#ccc",
  });

  // image = new Image({
  //   x: 400,
  //   y: 450,
  //   width: 100,
  //   height: 50,
  //   fill: "green",
  //   image: treeImage,
  // });

  rect2 = new Shape({
    x: 500,
    y: 300,
    width: 100,
    height: 50,
    fill: "red",
    stroke: "orange",
  });

  path = new Shape({
    x: 200,
    y: 200,
    stroke: "blue",
    lineWidth: 50,
    lineCap: "round",
    path: [
      move(10, 80),
      bezier3(95, 80, 40, 10, 65, 10),
      bezier3(180, 80, 150, 150),
    ],
  });

  path3 = new Shape({
    x: 300,
    y: 200,
    stroke: "yellow",
    // lineCap: "round",
    path: [
      move(10, 80),
      bezier3(95, 80, 40, 10, 65, 10),
      bezier3(180, 80, 150, 150),
    ],
  });

  path2 = new Shape({
    x: 300,
    y: 200,
    stroke: "blue",
    lineWidth: 50,
    lineCap: "round",
    path: [
      move(10, 80),
      bezier2(95, 80, 52.5, 10),
      bezier2(180, 80), //
    ],
  });

  roundRect = new Text({
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
    x: 400,
    y: 300,
    stroke: "blue",
    fill: "yellow",
    lineWidth: 6,
    textFill: "black",
    padding: 12,
    textAlign: "center",
    textPosition: "middle",
    fontWeight: "bold",
    fontStyle: "italic",
    path: roundedRect(0, 0, 200, 100, 25),
  });

  lemon = new Shape({
    x: 400,
    y: 300,
    stroke: "red",
    fill: "yellow",
    lineWidth: 5,
    lineCap: "square",
    path: [
      move(-50, 0),
      corner(50, 0, 0, -50, 50),
      corner(-50, 0, 0, 50, 50), //
    ],
  });

  roundTriangle = new Shape({
    x: 400,
    y: 300,
    stroke: "red",
    fill: "yellow",
    lineWidth: 3,
    path: [
      move(0, 50),
      corner(-50, -50, -100, 50, 10),
      corner(50, -50, 0, -150, 10),
      corner(0, 50, 100, 50, 10),
    ],
  });

  line = new Shape({
    x: 400,
    y: 300,
    stroke: "yellow",
    lineWidth: 100,
    path: [
      move(-50, 0),
      line(50, 0),
      line(50, 100),
      line(100, 150), //
    ],
  });

  group = new Group({
    x: 100,
    y: 100,
    angle: Math.PI / 4,

    children: [
      new Shape({
        stroke: "hotpink",
        x: 300,
        y: 300,
        lineWidth: 5,
        path: [arc(0, 0, 0, 1.75 * Math.PI, 50)],
      }),

      new Shape({
        x: 500,
        y: 300,
        width: 100,
        height: 50,
        fill: "red",
        stroke: "orange",
        lineCap: "round",
        lineJoin: "round",
      }),
    ],
  });

  async mount() {
    const treeImage = await Image.load(treeSrc);

    for (let i = 0; i < 0; i++) {
      this.shapes.push(
        // new Shape({
        //   fill: `rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`,
        new Image({
          image: treeImage,
          x: rand(0, 800),
          y: rand(0, 600),
          width: rand(10, 20),
          height: rand(10, 20),
        })
      );
    }

    // this.shapes.push(this.line);
    // this.shapes.push(this.image);
    // this.shapes.push(this.rect1);
    // this.shapes.push(this.rect2);
    // this.shapes.push(this.path);
    // this.shapes.push(this.path2);
    // this.shapes.push(this.path3);
    // this.shapes.push(this.roundRect);
    // this.shapes.push(this.roundTriangle);
    // this.shapes.push(this.lemon);
    this.shapes.push(this.group);
  }

  s = 1;

  tick() {
    let start: number, end: number;
    start = performance.now();

    for (const shape of this.shapes) {
      // shape.angle += 0.001 * this.deltaTime;
      // shape.build?.();
      // shape.update();
    }

    end = performance.now();
    // console.log("update", `${end - start}ms`);

    if (this.rect1.overlaps(this.rect2)) {
      this.rect1.fill = "lime";
      this.rect2.fill = "orange";
    } else {
      this.rect1.fill = "green";
      this.rect2.fill = "red";
    }

    if (this.rect1.overlaps(this.path)) {
      this.path.stroke = "red";
    } else {
      this.path.stroke = "blue";
    }

    render(this.ctx, this.shapes);
  }
}

function rand(min: number = 0, max: number = 1) {
  return min + Math.random() * (max - min);
}

// @ts-ignore
window.app = new App();
