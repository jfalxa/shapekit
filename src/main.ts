import { Loop } from "vroum";
import { Render } from "./webgl/render";
import { Rect } from "./geometry/rect";

function rand(min: number = 0, max: number = 1) {
  return min + Math.random() * (max - min);
}

class App extends Loop {
  canvas = document.getElementById("app") as HTMLCanvasElement;
  render = new Render(this.canvas, this);

  rect1 = new Rect({
    x: 400,
    y: 300,
    width: 100,
    height: 50,
    color: [0, 1, 0, 1],
  });

  rect2 = new Rect({
    x: 500,
    y: 300,
    width: 100,
    height: 50,
    color: [1, 0, 0, 1],
  });

  mount() {
    for (let i = 0; i < 16_000; i++) {
      this.render.add(
        new Rect({
          x: rand(0, 800),
          y: rand(0, 600),
          width: rand(10, 20),
          height: rand(10, 20),
          color: [rand(), rand(), rand(), 1],
        })
      );
    }

    this.render.add(this.rect1, this.rect2);
  }

  tick() {
    for (const shape of this.render.shapes) {
      if (shape === this.rect1 || shape === this.rect2) continue;
      shape.angle += this.deltaTime * 0.001;
    }

    this.rect1.angle += this.deltaTime * 0.001;
    this.rect2.angle += -this.deltaTime * 0.001;

    if (this.rect1.overlaps(this.rect2)) {
      this.rect1.color[3] = 0.5;
      this.rect2.color[3] = 0.5;
    } else {
      this.rect1.color[3] = 1;
      this.rect2.color[3] = 1;
    }
  }
}

// @ts-ignore
window.app = new App();
