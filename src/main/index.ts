import { app, globalShortcut, BrowserWindow, ipcMain } from "electron/main";
import { createWindow } from "./createWindow";
import { IUserStorage } from "./userStorage/IUserStorage";
import SQLiteUserStorage from "./userStorage/SQLiteUserStorage";
import { join, resolve } from "node:path";
import setupUserStorageIPC from "./userStorage/setupUserStorageIPC";

function main(): void {
  let mainWindow: null | BrowserWindow = null;

  app
    .whenReady()
    .then(() => {
      mainWindow = createWindow(mainWindow);
      app.on("activate", function () {
        if (mainWindow === null) {
          mainWindow = createWindow(mainWindow);
        }
      });
      const DB_DIR_PATH: string = resolve(join(app.getAppPath(), "data"));
      const DB_FILE_NAME = "users.sqlite";
      //const userStorage: IUserStorage = new SQLiteUserStorage(DB_DIR_PATH, DB_FILE_NAME);
      //setupUserStorageIPC(userStorage, mainWindow);
      ipcMain.on("new-user-storage", () => {
        console.log("New user storage command received by main!");
        const userStorage: IUserStorage = new SQLiteUserStorage(DB_DIR_PATH, DB_FILE_NAME);
        console.log("Closing user storage...");
        userStorage.close();
      });
    })
    .catch((err: unknown) => {
      console.error("Failed to initialise app :", err);
    });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
}

console.log("Starting main function execution.");
main();
console.log("Finished main function execution.");
