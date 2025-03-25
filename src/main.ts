import { Loop } from "vroum";
import { Render } from "./render";
import { Rect } from "./geometry/rect";

const canvas = document.getElementById("app")! as HTMLCanvasElement;

const loop = new Loop();
const render = new Render(canvas, loop);

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

for (let i = 0; i < 1000; i++) {
  const width = rand(10, 10);
  const height = rand(10, 10);
  const x = rand(width, 800 - width);
  const y = rand(height, 600 - height);

  render.shapes.push(
    new Rect({ x, y, width, height, fill: "red", stroke: "black" })
  );
}

const rect = new Rect({
  x: 400,
  y: 300,
  width: 100,
  height: 50,
  fill: "green",
  stroke: "yellow",
});

render.shapes.push(rect);

// @ts-ignore
window.rect = rect;
