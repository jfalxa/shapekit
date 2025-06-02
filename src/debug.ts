import { BBox } from "./bounds/bbox";
import { Group } from "./renderables/group";
import { Renderable } from "./renderables/renderable";

export function renderOBB(
  ctx: CanvasRenderingContext2D,
  renderables: Renderable[],
  color = "orange"
) {
  ctx.save();
  ctx.resetTransform();

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "square";
  ctx.lineWidth = 4;

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  for (const shape of flattenRenderables(renderables)) {
    ctx.beginPath();

    if (!("bbox" in shape) || !(shape.bbox instanceof BBox)) continue;

    ctx.moveTo(shape.bbox.a.x, shape.bbox.a.y);
    ctx.lineTo(shape.bbox.b.x, shape.bbox.b.y);
    ctx.lineTo(shape.bbox.c.x, shape.bbox.c.y);
    ctx.lineTo(shape.bbox.d.x, shape.bbox.d.y);
    ctx.closePath();

    ctx.stroke();

    // ctx.beginPath();
    // ctx.arc(shape.obb.center.x, shape.obb.center.y, 5, 0, 2 * Math.PI);
    // ctx.fill();

    ctx.beginPath();
    ctx.arc(shape.bbox.a.x, shape.bbox.a.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

export class Perf {
  logs: { name: string; time: number; duration: number }[] = [];

  time(name: string) {
    const time = performance.now();
    const previous = this.logs[this.logs.length - 1];
    const duration = previous ? time - previous.time : 0;
    this.logs.push({ name, time, duration });
    return duration;
  }

  averageOf(name: string) {
    const logs = this.logs.filter((log) => log.name === name);
    if (logs.length === 0) return 0;
    const total = logs.reduce((total, log) => total + log.duration, 0);
    return total / logs.length;
  }

  average() {
    if (this.logs.length === 0) return 0;
    const first = this.logs[0];
    const logs = this.logs.filter((log) => log.name === first.name);
    if (logs.length <= 1) return 0;
    const last = logs[logs.length - 1];
    const total = last.time - first.time;
    return total / (logs.length - 1);
  }

  log(interval: number) {
    console.log(`> Log started`);

    setInterval(() => {
      const named: string[] = [];
      const total = this.average().toFixed(2);

      const names = new Set(this.logs.map((log) => log.name));
      names.delete(this.logs[0].name);

      for (const name of names) {
        const average = this.averageOf(name).toFixed(2);
        named.push(`${name}: ${average}ms`);
      }

      console.log(`> ${total}ms [${named.join(" | ")}]`);
    }, interval);
  }
}

export function rand(min: number = 0, max: number = 1, seed: number) {
  return min + random(seed) * (max - min);
}

export function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    Math.floor(r).toString(16).padStart(2, "0") +
    Math.floor(g).toString(16).padStart(2, "0") +
    Math.floor(b).toString(16).padStart(2, "0")
  );
}

function random(seed: number): number {
  seed ^= seed >>> 16;
  seed *= 0x85ebca6b;
  seed ^= seed >>> 13;
  seed *= 0xc2b2ae35;
  seed ^= seed >>> 16;
  seed = seed >>> 0;
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  seed = (a * seed + c) % m;
  return seed / m;
}

export function getColor(seed: number): string {
  const r = Math.floor(random(seed) * 256);
  const g = Math.floor(random(seed + 10) * 256);
  const b = Math.floor(random(seed + 100) * 256);

  return rgbToHex(r, g, b);
}

export function deg(rad: number) {
  return Math.round((rad * 180) / Math.PI);
}

export function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function chain(functions: Function[], interval = 1000) {
  for (let i = 0; i <= functions.length; i++) {
    setTimeout(functions[i], (i + 1) * interval);
  }
}

function flattenRenderables(renderables: (Renderable | Transformer)[]) {
  const flat: (Renderable | Transformer)[] = [];
  for (const renderable of renderables) {
    flat.push(renderable);
    if (renderable instanceof Group) {
      flat.push(...flattenRenderables(renderable.children));
    }
  }
  return flat;
}
