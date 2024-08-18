type TransformToMainProcessIPCAPIHandler<T> = T extends () => Promise<infer R>
  ? () => R
  : T extends () => infer R
  ? () => R
  : T extends (callback: (...args: infer D) => infer E) => void
  ? (...args: D) => E
  : T extends (arg: infer A) => infer R
  ? (arg: A) => R
  : never;

export type MainProcessIPCAPIHandlers<IPCAPI> = {
  [K in keyof IPCAPI as `handle${Capitalize<string & K>}`]: TransformToMainProcessIPCAPIHandler<IPCAPI[K]>;
};
