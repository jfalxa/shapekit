export interface Cache {
  __version: number;
  __cache: Record<string, any>;
  __isDirty: boolean;
}

export interface Version<T> {
  version: number;
  value: T;
}

export type CacheUpdate<C extends Cache, T> = (obj: C, value?: T) => T;

export function cached<C extends Cache, T>(
  key: string,
  update: CacheUpdate<C, T>
) {
  return (obj: C) => {
    const cache = obj.__cache;
    let cached = cache[key] as Version<T>;

    if (cached === undefined) {
      cached = { version: -1, value: undefined as T };
      cache[key] = cached;
    }

    if (cached.version !== obj.__version) {
      cached.value = update(obj, cached.value);
      cached.version = obj.__version;
    }

    return cached.value;
  };
}

export function markDirty(cache: Cache) {
  cache.__isDirty = true;
  cache.__version++;
}

export function cleanDirty(cache: Cache) {
  cache.__isDirty = false;
}
