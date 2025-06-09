const DELETED = Symbol("DELETED");

export function remove<T>(array: T[], items: T[]) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const index = array.indexOf(item);
    array[index] = DELETED as T;
  }

  let writeIndex = 0;
  for (let readIndex = 0; readIndex < array.length; readIndex++) {
    if (array[readIndex] !== DELETED) {
      array[writeIndex++] = array[readIndex];
    }
  }

  array.length = writeIndex;
}
