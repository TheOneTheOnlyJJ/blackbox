import { app, globalShortcut, BrowserWindow, ipcMain } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import IUserStorage from "./userStorage/IUserStorage";
import SQLiteUserStorage from "./userStorage/SQLiteUserStorage";
import { join, resolve } from "node:path";

class App {
  private static instance: null | App = null;

  private mainWindow: null | BrowserWindow = null;
  private userStorage: null | IUserStorage = null;

  private readonly MAIN_WINDOW_CONSTRUCTOR_OPTIONS: BrowserWindowConstructorOptions = {
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

  /* private constructor to prevent direct instantiation */
  private constructor() {
    console.log("Running App constructor. To start, run the run() function.");
  }

  public run(): void {
    console.log("Running run() function, starting app.");
    app.on("ready", () => {
      this.onAppReady();
    });
    app.on("window-all-closed", () => {
      this.onAppWindowAllClosed();
    });
    app.on("will-quit", () => {
      this.onAppWillQuit();
    });
  }

  public static getInstance(): App {
    if (App.instance === null) {
      App.instance = new App();
    }
    return App.instance;
  }

  private createMainWindow(): void {
    console.log("Creating main window.");
    this.mainWindow = new BrowserWindow(this.MAIN_WINDOW_CONSTRUCTOR_OPTIONS);
    console.log("Created main window.");
    console.log("Registering main window event handlers.");
    this.mainWindow.on("closed", () => {
      this.onMainWindowClosed();
    });
    this.mainWindow.on("ready-to-show", () => {
      this.onMainWindowReadyToShow();
    });
    this.mainWindow.webContents.on("did-finish-load", () => {
      this.onMainWindowWebContentsDidFinishLoad();
    });
    this.mainWindow.webContents.on("did-fail-load", () => {
      this.onMainWindowWebContentsDidFailLoad();
    });
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      return this.mainWindowOpenHandler(details);
    });
    console.log("Registered main window event handlers.");
    console.log("Choosing main window web contents source...");
    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      console.log(`Loading main window web contents from URL: ${process.env.ELECTRON_RENDERER_URL}.`);
      void this.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", () => {
        this.developerToolsGlobalShortcutCallback();
      });
    } else {
      const INDEX_HTML_FILE_PATH: string = join(__dirname, "../renderer/index.html");
      console.log(`Loading main window web contents from file at path: ${INDEX_HTML_FILE_PATH}.`);
      void this.mainWindow.loadFile(INDEX_HTML_FILE_PATH);
    }
    // Log dev tools shortcut registration
    // TODO: Investigate this
    const MODE: string = app.isPackaged ? "production" : "development" + " mode";
    if (isDevToolsShortcutRegistered) {
      console.log(`Developer tools shortcut registered (${MODE}).`);
    } else {
      console.log(`Developer tools shortcut not registered (${MODE}).`);
    }
  }

  private onMainWindowClosed(): void {
    console.log("Main window closed.");
    this.mainWindow = null;
  }

  private onMainWindowReadyToShow(): void {
    console.log("Showing main window.");
    this.mainWindow?.show();
  }

  private onMainWindowWebContentsDidFinishLoad(): void {
    console.log("Loaded main window web contents.");
  }

  private onMainWindowWebContentsDidFailLoad(): void {
    console.log("Could not load main window web contents.");
  }

  private developerToolsGlobalShortcutCallback(): void {
    console.log("Developer tools shortcut pressed.");
    if (this.mainWindow !== null) {
      console.log("Opening developer tools.");
      this.mainWindow.webContents.openDevTools({ mode: "detach" });
      console.log("Opened developer tools.");
    } else {
      console.log("Main window is null. No-op.");
    }
  }

  private mainWindowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
    console.log("Running main window open handler.");
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

  private onAppReady(): void {
    console.log("App ready.");
    this.createMainWindow();
    app.on("activate", () => {
      this.onAppActivate();
    });
    ipcMain.on("new-user-storage", () => {
      this.onIPCMainNewUserStorage();
    });
  }

  private onAppActivate(): void {
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }

  private onAppWindowAllClosed(): void {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onAppWillQuit(): void {
    console.log("App will quit.");
    console.log("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    console.log("Unregistered all global shortcuts.");
    console.log("Checking for active user storage.");
    if (this.userStorage !== null) {
      console.log("Found active user storage. Closing...");
      this.userStorage.close();
      console.log("Closed user storage.");
    }
  }

  private onIPCMainNewUserStorage(): void {
    console.log("New user storage command received by main.");
    const DB_DIR_PATH: string = resolve(join(app.getAppPath(), "data"));
    const DB_FILE_NAME = "users.sqlite";
    this.userStorage = new SQLiteUserStorage(DB_DIR_PATH, DB_FILE_NAME);
  }
}

App.getInstance().run();
