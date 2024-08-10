import log, { LogFunctions } from "electron-log";

export const appLogger: LogFunctions = log.scope("renderer-app");
