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
    console.log(`> Log started`);
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
