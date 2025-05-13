const DELETED = Symbol("DELETED");

export function remove<T>(array: T[], items: T[]) {
  const deleted = array as (T | typeof DELETED)[];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const index = array.indexOf(item);
    deleted[index] = DELETED;
  }

  let writeIndex = 0;
  for (let readIndex = 0; readIndex < deleted.length; readIndex++) {
    if (deleted[readIndex] !== DELETED) {
      deleted[writeIndex++] = deleted[readIndex];
    }
  }

  array.length = writeIndex;
}
