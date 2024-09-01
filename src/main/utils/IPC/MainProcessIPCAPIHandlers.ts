// Transform a renderer process IPC API method to its corresponding main process IPC API handler
type TransformToMainProcessIPCAPIHandler<T> = T extends (callback: (...args: infer CallbackArgsType) => infer CallbackReturnType) => () => void
  ? (...args: CallbackArgsType) => CallbackReturnType
  : T extends (...args: infer CallbackArgsType) => Promise<infer CallbackReturnType>
  ? (...args: CallbackArgsType) => CallbackReturnType | Promise<CallbackReturnType>
  : T extends (...args: infer CallbackArgsType) => infer CallbackReturnType
  ? (...args: CallbackArgsType) => CallbackReturnType
  : never;

// Extract the part of the key after "on" or "once"
type ExtractEventName<S extends string> = S extends `once${infer Rest}` ? Rest : S extends `on${infer Rest}` ? Rest : never;

// Determine if a key starts with "on" or "once"
type IsEventListener<S extends string> = S extends `once${string}` | `on${string}` ? true : false;

export type MainProcessIPCAPIHandlers<IPCAPI> = {
  [K in keyof IPCAPI as IsEventListener<string & K> extends true
    ? `send${Capitalize<ExtractEventName<string & K>>}`
    : `handle${Capitalize<string & K>}`]: TransformToMainProcessIPCAPIHandler<IPCAPI[K]>;
};
