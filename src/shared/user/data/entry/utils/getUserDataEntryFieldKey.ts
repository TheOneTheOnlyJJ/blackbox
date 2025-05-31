export const getUserDataEntryFieldKey = (fieldIndex: number): string => {
  // The leading underscore must be added to avoid interpreting the keys as array indexes in objects
  return `_${fieldIndex.toString()}`;
};
