export type Constructor<C> = new (...args: any[]) => C;

export function track<C>(
  constructor: Constructor<C>,
  props: (keyof C)[],
  onChange?: (instance: C, prop: string, newValue: any, oldValue: any) => void
) {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i] as string;
    const __prop = `__${String(prop)}`;
    Object.defineProperty(constructor.prototype, prop, {
      enumerable: true,
      configurable: true,
      get() {
        return this[__prop];
      },
      set(newValue: number) {
        const oldValue = this[__prop];
        if (newValue !== oldValue) {
          this[__prop] = newValue;
          if (oldValue !== undefined) {
            onChange?.(this, prop, newValue, oldValue);
          }
        }
      },
    });
  }
}
