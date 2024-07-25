import { BrowserWindow, ipcMain } from "electron/main";
import { IUserStorage } from "./IUserStorage";

export default function setupUserStorageIPC(userStorage: IUserStorage, window: null | BrowserWindow): void {
  if (window === null) {
    return;
  }
  console.log(userStorage.getIPCInfo());
}
