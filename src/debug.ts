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
