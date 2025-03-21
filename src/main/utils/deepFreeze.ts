export const deepFreeze = <T>(o: T): Readonly<T> => {
  if (o === null || o === undefined || typeof o !== "object" || Buffer.isBuffer(o)) {
    return o;
  }
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach((prop: string): void => {
    if (o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
};
