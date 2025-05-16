export function trackDirty(
  object: object,
  props: string[],
  onChange?: (instance: any) => void
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
      set(value: number) {
        if (value !== this[__prop]) {
          const oldProp = this[__prop];
          this[__prop] = value;
          this.dirty = true;
          if (oldProp !== undefined) onChange?.(this);
        }
      },
    });
  }
}
