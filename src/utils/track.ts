export interface Dirty {
  __dirty: boolean;
}

export function track(
  object: object,
  props: string[],
  onChange?: (instance: any, prop: string, newValue: any, oldValue: any) => void
) {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i] as keyof typeof object;
    const __prop = `__${String(prop)}`;
    Object.defineProperty(object, prop, {
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
