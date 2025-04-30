import { Loop } from "vroum";
import { renderAll } from "./render/canvas2d";
import { Shape } from "./shapes/shape";
import treeSrc from "./tree.png";
import { Text } from "./shapes/text";
import { Image } from "./shapes/image";
import { bezier3, move, arc, roundRect, corner } from "./path";
import { Group } from "./shapes/group";
import { Renderable } from "./shapes/renderable";
import { renderHulls, renderOBB } from "./utils/debug";
import { Matrix3 } from "./math/mat3";
import { Vec2 } from "./math/vec2";

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
    stroke: "red",
    // lineWidth: 10,
    lineCap: "square",
    // shadowBlur: 1,
    // shadowOffsetX: 3,
    // shadowOffsetY: 3,
    // shadowColor: "#ccc",
  });

  // image = new Image({
  //   x: 400,
  //   y: 450,
  //   width: 100,
  //   height: 50,
  //   fill: "green",
  //   image: treeImage,
  // });

  // rect2 = new Shape({
  //   x: 500,
  //   y: 300,
  //   width: 100,
  //   height: 50,
  //   fill: "red",
  //   stroke: "orange",
  // });

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

  // path2 = new Shape({
  //   x: 300,
  //   y: 200,
  //   stroke: "blue",
  //   lineWidth: 50,
  //   lineCap: "round",
  //   path: [
  //     move(10, 80),
  //     bezier2(95, 80, 52.5, 10),
  //     bezier2(180, 80), //
  //   ],
  // });

  path3 = new Shape({
    x: 300,
    y: 200,
    stroke: "blue",
    lineCap: "round",
    path: [
      move(10, 80),
      bezier3(95, 80, 40, 10, 65, 10),
      bezier3(180, 80, 150, 150),
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
    textPosition: "bottom",
    fontWeight: "bold",
    fontStyle: "italic",
    path: [roundRect(0, 0, 200, 100, 25)],
  });

  // lemon = new Shape({
  //   x: 400,
  //   y: 300,
  //   stroke: "red",
  //   fill: "yellow",
  //   lineWidth: 5,
  //   lineCap: "square",
  //   path: [
  //     move(-50, 0),
  //     corner(50, 0, 0, -50, 50),
  //     corner(-50, 0, 0, 50, 50), //
  //   ],
  // });

  roundTriangle = new Shape({
    x: 400,
    y: 300,
    stroke: "red",
    fill: "yellow",
    lineWidth: 3,
    path: [
      move(0, 50),
      corner(-50, -50, -100, 50, 25),
      corner(50, -50, 0, -150, 25),
      corner(0, 50, 100, 50, 25),
    ],
  });

  // line = new Shape({
  //   x: 400,
  //   y: 300,
  //   stroke: "yellow",
  //   lineWidth: 100,
  //   path: [
  //     move(-50, 0),
  //     line(50, 0),
  //     line(50, 100),
  //     line(100, 150), //
  //   ],
  // });

  circle = new Shape({
    x: 400,
    y: 300,
    stroke: "hotpink",
    // lineWidth: 5,
    // rotation: Math.PI / 4,
    path: [arc(0, 0, 200, (3 * Math.PI) / 2, (3 * Math.PI) / 2 + 0.6)],
  });

  skewed = new Group({
    x: 400,
    y: 300,

    // scaleX: 0.5,

    children: [
      new Text({
        text: "Skewed",
        width: 100,
        height: 100,
        fill: "#ff0000",
        textFill: "#000000",
        fontSize: 18,
        padding: 8,
        rotation: Math.PI / 3,
        // scaleY: 1.5,
        // skewX: Math.PI / 6,
        // skewY: Math.PI / 6,
      }),
    ],
  });

  group = new Group({
    id: "ROOT",
    x: 400,
    y: 300,

    children: [
      new Group({
        id: "GROUP",
        x: 73.3623046875,
        y: -58.7176513671875,
        rotation: Math.PI / 4,

        children: [
          new Shape({
            id: "ARC",
            x: -100,
            stroke: "hotpink",
            // lineWidth: 5,
            rotation: Math.PI / 3,
            path: [arc(0, 0, 50, 0, 1.75 * Math.PI)],
          }),

          new Shape({
            id: "PATH",
            x: -100,
            y: 100,
            // x: -85,
            // y: -52.5,

            stroke: "blue",
            lineWidth: 50,
            lineCap: "round",
            path: [
              move(10, 80),
              bezier3(95, 80, 40, 10, 65, 10),
              bezier3(180, 80, 150, 150),
            ],
          }),

          new Text({
            id: "TEXT",
            y: 75,
            // width: 50,
            // height: 200,
            stroke: "black",
            lineWidth: 5,
            text: "A centered title",
            textFill: "blue",
            textAlign: "center",
            fontSize: 16,
            lineHeight: 24,
            padding: 8,
          }),

          new Shape({
            stroke: "red",
            fill: "yellow",
            lineWidth: 3,
            path: [
              move(0, 50),
              corner(-50, -50, -100, 50, 25),
              corner(50, -50, 0, -150, 25),
              corner(0, 50, 100, 50, 25),
            ],
          }),
        ],
      }),
    ],
  });

  group2 = new Group({
    x: 400,
    y: 300,

    children: [
      new Shape({
        x: -100,
        y: -100,
        width: 100,
        height: 50,
        fill: "red",
        rotation: Math.PI / 4,
      }),
      new Shape({
        x: 100,
        y: -100,
        width: 100,
        height: 50,
        fill: "green",
      }),
      new Shape({
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        fill: "blue",
        rotation: Math.PI / 4,
      }),
      new Shape({
        x: -100,
        y: 100,
        width: 100,
        height: 50,
        fill: "yellow",
      }),
    ],
  });

  async mount() {
    const treeImage = await Image.load(treeSrc);

    (this.group.children[0] as Group).children.push(
      new Image({
        id: "IMAGE",
        x: +100,
        stroke: "orange",
        image: treeImage,
        path: [roundRect(0, 0, 100, 50, 15)],
      })
    );

    this.group.update(true);

    for (let i = 0; i < 0; i++) {
      this.shapes.push(
        new Shape({
          fill: rgbToHex(rand(0, 255), rand(0, 255), rand(0, 255)),
          // new Image({
          // image: treeImage,
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
    this.shapes.push(this.roundTriangle);
    // this.shapes.push(this.lemon);
    // this.shapes.push(this.group);
    // this.shapes.push(this.group2);
    // this.shapes.push(this.skewed);
    // this.shapes.push(this.circle);
  }

  s = 1;

  tick() {
    let start: number, mid: number, end: number;
    start = performance.now();

    for (const shape of this.shapes) {
      // shape.rotation += 0.001 * this.deltaTime;
      // shape.update();
      shape.update(true);
    }

    mid = performance.now();

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

    renderAll(this.ctx, this.shapes);
    renderOBB(this.ctx, this.shapes);
    renderHulls(this.ctx, this.shapes);

    end = performance.now();

    const message = `total = ${end - start}ms, update = ${
      mid - start
    }ms, render = ${end - mid}ms`;

    // console.log(message);
  }
}

function rand(min: number = 0, max: number = 1) {
  return min + Math.random() * (max - min);
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    Math.floor(r).toString(16).padStart(2, "0") +
    Math.floor(g).toString(16).padStart(2, "0") +
    Math.floor(b).toString(16).padStart(2, "0")
  );
}

// @ts-ignore
window.app = new App();

// @ts-ignore
window.Matrix3 = Matrix3;
// @ts-ignore
window.Vec2 = Vec2;
