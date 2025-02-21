import log, { LogFunctions } from "electron-log";

export const appLogger: LogFunctions = log.scope("renderer-app");
export const userLogger: LogFunctions = log.scope("renderer-user"); // TODO: Use these or delete them?
export const IPCLogger: LogFunctions = log.scope("renderer-ipc");
