import { Renderable } from "../renderables/renderable";

export interface Version<T> {
  version: number;
  value: T;
}

export interface CacheUpdate<T> {
  (renderable: Renderable, value: T | undefined): T;
}

export function cached<T>(key: string, update: CacheUpdate<T>) {
  return (renderable: Renderable) => {
    const cache = renderable.__cache;
    let cached = cache[key] as Version<T>;

    if (cached === undefined) {
      cached = { version: -1, value: undefined as T };
      cache[key] = cached;
    }

    if (cached.version !== renderable.__version) {
      cached.value = update(renderable, cached.value);
      cached.version = renderable.__version;
    }

    return cached.value;
  };
}
