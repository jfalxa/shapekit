export type Path = Segment[];

export abstract class Segment {
  constructor(public x: number, public y: number) {}
}
