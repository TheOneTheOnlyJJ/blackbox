type TransformToMainProcessIPCAPIHandler<T> = T extends (callback: (...args: infer D) => infer E) => void
  ? (...args: D) => E
  : T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => R | Promise<R>
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : never;

export type MainProcessIPCAPIHandlers<IPCAPI> = {
  [K in keyof IPCAPI as `handle${Capitalize<string & K>}`]: TransformToMainProcessIPCAPIHandler<IPCAPI[K]>;
};
