// import * as brush from "./index";
// console.log(brush);
import { Loop } from "vroum";
import { Canvas2D } from "./renderers/canvas2d";
import { Shape } from "./renderables/shape";
import { Text } from "./renderables/text";
import { Image } from "./renderables/image";
import { Group } from "./renderables/group";
import { Matrix3 } from "./math/mat3";
import { Vec2 } from "./math/vec2";
import { linearGradient } from "./styles/linear-gradient";
import { bezierCurveTo } from "./paths/bezier-curve-to";
import { moveTo } from "./paths/move-to";
import { quadraticCurveTo } from "./paths/quadratic-curve-to";
import { arcTo } from "./paths/arc-to";
import { lineTo } from "./paths/line-to";
import { arc } from "./paths/arc";
import { ellipse } from "./paths/ellipse";
import { roundRect } from "./paths/round-rect";
import { closePath } from "./paths/close-path";
import { rect } from "./paths/rect";
import { Clip } from "./renderables/clip";
import { getColor, Perf, rad, rand, renderOBB } from "./debug";

import treeSrc from "./tree.png";
import { buildAABB } from "./bbox/path";

class App extends Loop {
  scene = new Group();

  canvas = new Canvas2D(this.scene, { width: 800, height: 600 });

  rect1 = new Shape({
    x: 400,
    y: 300,
    fill: "green",
    stroke: "red",
    // lineWidth: 10,
    lineCap: "square",
    path: [rect(0, 0, 100, 50)],
    // shadowBlur: 1,
    // shadowOffsetX: 3,
    // shadowOffsetY: 3,
    // shadowColor: "#ccc",
  });

  rect2 = new Shape({
    x: 500,
    y: 300,
    fill: "red",
    stroke: "orange",
    path: [rect(0, 0, 100, 50)],
  });

  rect3 = new Shape({
    x: 400,
    y: 300,
    fill: "cyan",
    stroke: "blue",
    path: [rect(-50, -25, 100, 50)],
  });

  path = new Shape({
    x: 250,
    y: 200,
    stroke: "blue",
    lineWidth: 50,
    lineCap: "round",
    path: [
      moveTo(10, 80),
      bezierCurveTo(40, 10, 65, 10, 95, 80),
      bezierCurveTo(150, 150, 180, 80),
    ],
  });

  path2 = new Shape({
    x: 300,
    y: 200,
    stroke: "blue",
    lineWidth: 50,
    lineCap: "round",
    path: [
      moveTo(10, 80),
      quadraticCurveTo(52.5, 10, 95, 80),
      quadraticCurveTo(180, 80),
      quadraticCurveTo(265, 80),
    ],
  });

  path3 = new Shape({
    x: 300,
    y: 200,
    stroke: "blue",
    lineCap: "round",
    path: [
      moveTo(10, 80),
      bezierCurveTo(40, 10, 65, 10, 95, 80),
      bezierCurveTo(150, 150, 180, 80),
    ],
  });

  roundRect = new Shape({
    x: 400,
    y: 300,
    fill: "hotpink",
    path: [roundRect(-100, -50, 200, 100, 25)],
  });

  text = new Text({
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    x: 400,
    y: 300,
    width: 200,
    height: 100,
  });

  lemon = new Shape({
    x: 400,
    y: 300,
    stroke: "red",
    fill: "yellow",
    lineWidth: 5,
    lineCap: "square",
    path: [
      moveTo(-50, 0),
      arcTo(50, 0, 0, -50, 50),
      arcTo(-50, 0, 0, 50, 50), //
    ],
  });

  roundTriangle = new Shape({
    x: 400,
    y: 300,
    stroke: "red",
    fill: "yellow",
    lineWidth: 3,
    path: [
      moveTo(0, 50),
      arcTo(-100, 50, -50, -50, 25),
      arcTo(0, -150, 50, -50, 25),
      arcTo(100, 50, 0, 50, 25),
      closePath(),
    ],
  });

  polyline = new Shape({
    x: 400,
    y: 300,
    stroke: "yellow",
    lineWidth: 100,
    path: [
      moveTo(-50, 0), //
      lineTo(50, 0),
      lineTo(50, 100),
      lineTo(100, 150),
    ],
  });

  circle = new Shape({
    x: 400,
    y: 300,
    // lineWidth: 5,
    // rotation: Math.PI / 4,
    fill: "red",
    lineWidth: 5,
    stroke: "red",
    path: [
      moveTo(0, 0), //
      arc(0, 0, 100, rad(0), rad(330), false),
      closePath(),
    ],
  });

  arc = new Shape({
    x: 400,
    y: 300,
    stroke: "hotpink",
    // lineWidth: 5,
    // rotation: Math.PI / 4,
    path: [arc(0, 0, 200, (3 * Math.PI) / 2, (3 * Math.PI) / 2 + 0.6)],
  });

  ellipse = new Shape({
    x: 400,
    y: 300,
    stroke: "purple",
    path: [ellipse(0, 0, 100, 50, Math.PI / 3)],
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
          new Clip({
            x: -140,
            y: -100,
            path: [rect(0, 0, 400, 400)],
          }),

          new Shape({
            id: "ARC",
            x: -100,
            stroke: "hotpink",
            // lineWidth: 5,
            rotation: Math.PI / 3,
            path: [arc(0, 0, 50, 0, 1.75 * Math.PI)],
            fill: linearGradient(-50, -50, 50, 50, {
              25: "yellow",
              50: "red",
              75: "blue",
            }),
          }),

          new Shape({
            id: "PATH",
            x: -100,
            y: 100,
            stroke: "blue",
            lineWidth: 50,
            lineCap: "round",
            path: [
              moveTo(10, 80),
              bezierCurveTo(40, 10, 65, 10, 95, 80),
              bezierCurveTo(150, 150, 180, 80),
            ],
          }),

          new Text({
            id: "TEXT",
            y: 75,
            width: 200,
            height: 50,
            text: "A centered title",
            textFill: "red",
            textAlign: "center",
            fontSize: 16,
            lineHeight: 24,
            padding: 8,
          }),

          new Shape({
            id: "ROUND_TRIANGLES",
            stroke: "red",
            fill: "yellow",
            lineWidth: 3,
            globalAlpha: 0.5,
            path: [
              moveTo(0, 50),
              arcTo(-100, 50, -50, -50, 25),
              arcTo(0, -150, 50, -50, 25),
              arcTo(100, 50, 0, 50, 25),
              closePath(),

              moveTo(200, 50),
              arcTo(100, 50, 150, -50, 25),
              arcTo(200, -150, 250, -50, 25),
              arcTo(300, 50, 200, 50, 25),
              closePath(),
            ],
          }),

          new Shape({
            id: "SHOLVA",
            x: 50,
            y: 250,
            rotation: -Math.PI / 3.5,
            stroke: "green",
            lineWidth: 50,
            lineCap: "round",
            path: [
              moveTo(10, 80),
              quadraticCurveTo(52.5, 10, 95, 80),
              quadraticCurveTo(180, 80),
              quadraticCurveTo(265, 80),
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
        fill: "red",
        rotation: Math.PI / 4,
        path: [rect(0, 0, 100, 50)],
      }),
      new Shape({
        x: 100,
        y: -100,
        fill: "green",
        path: [rect(0, 0, 100, 50)],
      }),
      new Shape({
        x: 100,
        y: 100,
        fill: "blue",
        rotation: Math.PI / 4,
        path: [rect(0, 0, 100, 50)],
      }),
      new Shape({
        x: -100,
        y: 100,
        fill: "yellow",
        path: [rect(0, 0, 100, 50)],
      }),
    ],
  });

  transformer!: Transformer;

  perf = new Perf();

  async mount() {
    document.body.append(this.canvas.element);

    (this.group.children[0] as Group).children.push(
      new Image({
        id: "IMAGE",
        x: +100,
        width: 100,
        height: 50,
        image: await Image.load(treeSrc),
      })
    );

    // this.transformer = new Transformer(this.group.children[0].children);
    // this.transformer = new Transformer([this.roundRect, this.roundTriangle]);
    // this.transformer = new Transformer([this.roundRect]);
    // this.transformer = new Transformer([this.rect3]);
    // this.transformer = new Transformer([this.circle]);
    // this.transformer = new Transformer([this.group.children[0].children[0]]);

    // for (let i = 0; i < 8000; i++) {
    for (let i = 0; i < 0; i++) {
      this.scene.add(
        // new Group({
        //   children: [
        new Shape({
          fill: getColor(i),
          // new Image({
          // image: treeImage,
          x: rand(0, 800, i),
          y: rand(0, 600, i * 2),
          path: [rect(0, 0, rand(10, 20, i), rand(10, 20, i * i))],
          // path: [
          //   moveTo(0, 0),
          //   arc(0, 0, rand(10, 20), 0, rad(315)),
          //   closePath(),
          // ],
        })
        //   ],
        // })
      );
    }

    // this.scene.add(this.polyline);
    // this.scene.add(this.rect1);
    // this.scene.add(this.rect2);
    // this.scene.add(this.rect3);
    // this.scene.add(this.path);
    // this.scene.add(this.path2);
    // this.scene.add(this.path3);
    // this.scene.add(this.roundRect);
    // this.scene.add(this.roundTriangle);
    // this.scene.add(this.lemon);
    this.scene.add(this.group);
    // this.scene.add(this.group2);
    // this.scene.add(this.skewed);
    // this.scene.add(this.circle);
    // this.scene.add(this.arc);
    // this.scene.add(this.ellipse);

    this.perf.log(1500);
  }

  tick() {
    this.perf.time("start");

    for (const shape of this.scene.children) {
      shape.rotation += 0.001 * this.deltaTime;
    }

    this.perf.time("rotate");

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

    this.canvas.update();

    this.perf.time("render");

    // renderOBB(this.canvas.ctx, this.canvas.scene.children);
    // renderHulls(this.canvas.ctx, this.canvas.children);

    // if (this.transformer) {
    // renderOBB(this.canvas.ctx, [this.transformer], "lime");
    // const a = this.transformer.obb.a.clone().transform(this.transformer._invTransform); // prettier-ignore
    // this.ctx.fillStyle = "hotpink";
    // this.ctx.beginPath();
    // this.ctx.arc(a.x, a.y, 5, 0, 2 * Math.PI);
    // this.ctx.fill();
    // }
  }
}

// @ts-ignore
window.app = new App();

// @ts-ignore
window.Matrix3 = Matrix3;
// @ts-ignore
window.Vec2 = Vec2;

// function resize(path: PathLike, bbox: AABB, width: number, height: number) {
//   let lastMoveTo: MoveTo | undefined;

//   const sx = width && bbox.width ? width / bbox.width : 1;
//   const sy = height && bbox.height ? height / bbox.height : 1;

//   for (let i = 0; i < path.length; i++) {
//     const s = path[i];
//     s.x *= sx;
//     s.y *= sy;

//     if (s instanceof MoveTo) {
//       lastMoveTo = s;
//     } else if (s instanceof ClosePath && lastMoveTo) {
//       s._x = lastMoveTo.x;
//       s._y = lastMoveTo.y;
//     } else if (s instanceof Rect) {
//       s.width *= sx;
//       s.height *= sy;
//     } else if (s instanceof Ellipse) {
//       s.radiusX *= sx;
//       s.radiusY *= sy;
//     } else if (s instanceof Arc) {
//       s.radiusX *= sx;
//       s.radiusY *= sy;
//     } else if (s instanceof ArcTo) {
//       s.cpx *= sx;
//       s.cpy *= sy;
//       s.radiusX *= sx;
//       s.radiusY *= sy;
//     } else if (s instanceof QuadraticCurveTo) {
//       [s._cpx, s._cpy] = getControl(s, path[i - 1], sx, sy);
//     } else if (s instanceof BezierCurveTo) {
//       [s._cp1x, s._cp1y] = getControl(s, path[i - 1], sx, sy);
//       s.cp2x *= sx;
//       s.cp2y *= sy;
//     }
//   }

//   buildAABB(path, bbox);
// }
