import { app, globalShortcut, BrowserWindow, ipcMain } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import IUserStorage from "./userStorage/IUserStorage";
import SQLiteUserStorage from "./userStorage/SQLiteUserStorage";
import { join, resolve } from "node:path";

/* eslint-disable @typescript-eslint/no-extraneous-class, @typescript-eslint/unbound-method */

class App {
  private static instance: null | App = null;

  private static mainWindow: null | BrowserWindow = null;
  private static userStorage: null | IUserStorage = null;

  private static readonly MAIN_WINDOW_CONSTRUCTOR_OPTIONS: BrowserWindowConstructorOptions = {
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(join(app.getAppPath(), "resources", "icon.png")),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      allowRunningInsecureContent: false
    }
  };

  private constructor() {
    app.on("ready", App.onAppReady);
    app.on("window-all-closed", App.onAppWindowAllClosed);
    app.on("will-quit", App.onAppWillQuit);
  }

  static run(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  static createMainWindow(): void {
    App.mainWindow = new BrowserWindow(App.MAIN_WINDOW_CONSTRUCTOR_OPTIONS);
    App.mainWindow.on("closed", App.onMainWindowClosed);
    App.mainWindow.on("ready-to-show", App.onMainWindowReadyToShow);
    App.mainWindow.webContents.on("did-finish-load", App.onMainWindowWebContentsDidFinishLoad);
    App.mainWindow.webContents.on("did-fail-load", App.onMainWindowWebContentsDidFailLoad);
    App.mainWindow.webContents.setWindowOpenHandler(App.mainWindowOpenHandler);

    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      void App.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", App.developerToolsGlobalShortcutCallback);
    } else {
      void App.mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
    // Log dev tools shortcut registration
    if (isDevToolsShortcutRegistered) {
      console.log("Developer tools shortcut registered in development mode.");
    } else if (!app.isPackaged) {
      console.log("Developer tools shortcut could not be registered in development mode.");
    } else {
      console.log("Developer tools shortcut not registered in production mode.");
    }
  }

  static onMainWindowClosed(): void {
    App.mainWindow = null;
  }

  static onMainWindowReadyToShow(): void {
    console.log("Showing main window.");
    App.mainWindow?.show();
  }

  static onMainWindowWebContentsDidFinishLoad(): void {
    console.log("Loaded main window web content.");
  }

  static onMainWindowWebContentsDidFailLoad(): void {
    console.log("Could not load main window web content.");
  }

  static developerToolsGlobalShortcutCallback(): void {
    console.log("Developer tools shortcut pressed.");
    if (App.mainWindow !== null) {
      console.log("Main window is not null. Opening developer tools.");
      App.mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      console.log("Main window is null. No-op.");
    }
  }

  static mainWindowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
    shell
      .openExternal(details.url)
      .then(() => {
        console.log(`Opened external URL: ${details.url}`);
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.log(`Could not open external URL (${details.url}): ${errorMessage}.`);
      });
    return { action: "deny" };
  }

  static onAppReady(): void {
    App.createMainWindow();
    app.on("activate", App.onAppActivate);
    ipcMain.on("new-user-storage", App.onIPCMainNewUserStorage);
  }

  static onAppActivate(): void {
    if (App.mainWindow === null) {
      App.createMainWindow();
    }
  }

  static onAppWindowAllClosed(): void {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  static onAppWillQuit(): void {
    console.log("App will quit.");
    console.log("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    console.log("Unregistered all global shortcuts.");
    console.log("Checking for active user storage.");
    if (App.userStorage !== null) {
      console.log("Found active user storage. Closing...");
      App.userStorage.close();
      console.log("Closed user storage.");
    }
  }

  static onIPCMainNewUserStorage(): void {
    console.log("New user storage command received by main.");
    const DB_DIR_PATH: string = resolve(join(app.getAppPath(), "data"));
    const DB_FILE_NAME = "users.sqlite";
    App.userStorage = new SQLiteUserStorage(DB_DIR_PATH, DB_FILE_NAME);
  }
}

/* eslint-enable @typescript-eslint/no-extraneous-class, @typescript-eslint/unbound-method */

App.run();
