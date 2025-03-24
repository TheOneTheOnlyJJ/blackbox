export interface IDataChangedDiff<TRemoved, TAdded> {
  removed: TRemoved[];
  added: TAdded[];
}

export const isValidDataChangedDiff = <TRemoved, TAdded>(
  data: unknown,
  isValidRemoved: (removedData: unknown) => removedData is TRemoved,
  isValidAdded: (addedData: unknown) => addedData is TAdded
): data is IDataChangedDiff<TRemoved, TAdded> => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  if (!("removed" in data) || !("added" in data)) {
    return false;
  }
  const { removed, added } = data;
  if (!Array.isArray(removed) || !Array.isArray(added)) {
    return false;
  }
  return (
    removed.every((value: unknown): value is TRemoved => {
      return isValidRemoved(value);
    }) &&
    added.every((value: unknown): value is TAdded => {
      return isValidAdded(value);
    })
  );
};
