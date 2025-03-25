import { ipcRenderer } from "electron";
import { LogLevel, LogMessage } from "electron-log";

export const sendLogToMainProcess = (scope: string, level: LogLevel, message: string): void => {
  ipcRenderer.send("__ELECTRON_LOG__", {
    date: new Date(),
    scope: scope,
    level: level,
    data: [message],
    variables: { processType: "renderer" }
  } satisfies LogMessage);
};
