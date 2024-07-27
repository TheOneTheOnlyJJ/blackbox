import { app, globalShortcut, BrowserWindow, ipcMain } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import IUserStorage from "./userStorage/IUserStorage";
import SQLiteUserStorage from "./userStorage/SQLiteUserStorage";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";

export default class App {
  private static instance: null | App = null;
  private static isElectronLogInitialised = false; // This exists to make sure electron-log initialisation is done only once

  private mainWindow: null | BrowserWindow = null;
  private userStorage: null | IUserStorage = null;

  private bootstrapLogger: LogFunctions;
  private appLogger: LogFunctions;
  private windowLogger: LogFunctions;
  private userStorageLogger: LogFunctions;

  private readonly MAIN_WINDOW_CONSTRUCTOR_OPTIONS: BrowserWindowConstructorOptions = {
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(join(app.getAppPath(), "resources", "icon.png")),
    webPreferences: {
      preload: join(__dirname, "..", "preload", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      allowRunningInsecureContent: false
    }
  };

  // Private constructor to prevent direct instantiation
  private constructor() {
    let wasElectronLogInitialisedNow: boolean;
    // Initialise electron-log only once per app lifecycle
    if (!App.isElectronLogInitialised) {
      App.initialiseElectronLog();
      App.isElectronLogInitialised = true;
      wasElectronLogInitialisedNow = true;
    } else {
      wasElectronLogInitialisedNow = false;
    }
    // Initialise scoped loggers
    this.bootstrapLogger = log.scope("main-bootstrap");
    this.windowLogger = log.scope("main-window");
    this.appLogger = log.scope("main-app");
    this.userStorageLogger = log.scope("main-user-storage");
    // These are here to make sure I'm not insane
    this.bootstrapLogger.info("Running App constructor.");
    if (wasElectronLogInitialisedNow) {
      this.bootstrapLogger.info("Electron-log initialised.");
    } else {
      this.bootstrapLogger.info("Electron-log was already initialised."); // This should never run if the App class is a proper singleton
    }
    this.bootstrapLogger.info(`Using log file at path: ${log.transports.file.getFile().path}.`);
  }

  public run(): void {
    this.bootstrapLogger.info("Running run() function, starting app.");
    this.bootstrapLogger.debug("Registering app event handlers.");
    app.on("ready", () => {
      this.onAppReady();
    });
    app.on("window-all-closed", () => {
      this.onAppWindowAllClosed();
    });
    app.on("will-quit", () => {
      this.onAppWillQuit();
    });
    this.bootstrapLogger.debug("Registered app event handlers.");
  }

  public static getInstance(): App {
    if (App.instance === null) {
      App.instance = new App();
    }
    return App.instance;
  }

  private static initialiseElectronLog(): void {
    log.initialize();
    // Set log file path
    log.transports.file.resolvePathFn = () => {
      return join(app.getAppPath(), "logs", "BlackBoxLogs.log");
    };
    // Override all console functions with electron-log functions
    Object.assign(console, log.functions);
    log.errorHandler.startCatching();
    log.eventLogger.startLogging();
  }

  private createMainWindow(): void {
    this.windowLogger.info("Creating main window.");
    this.mainWindow = new BrowserWindow(this.MAIN_WINDOW_CONSTRUCTOR_OPTIONS);
    this.windowLogger.debug("Created main window.");
    this.windowLogger.debug("Registering main window event handlers.");
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
    this.windowLogger.debug("Registered main window event handlers.");
    this.windowLogger.info("Choosing main window web contents source...");
    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      this.windowLogger.info(`Loading main window web contents from URL: ${process.env.ELECTRON_RENDERER_URL}.`);
      void this.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", () => {
        this.developerToolsGlobalShortcutCallback();
      });
    } else {
      const INDEX_HTML_FILE_PATH: string = join(__dirname, "..", "renderer", "index.html");
      this.windowLogger.info(`Loading main window web contents from file at path: ${INDEX_HTML_FILE_PATH}.`);
      void this.mainWindow.loadFile(INDEX_HTML_FILE_PATH);
    }
    // Log dev tools shortcut registration
    // TODO: Investigate this
    const MODE: string = app.isPackaged ? "production" : "development" + " mode";
    if (isDevToolsShortcutRegistered) {
      this.windowLogger.debug(`Developer tools shortcut registered (${MODE}).`);
    } else {
      this.windowLogger.debug(`Developer tools shortcut not registered (${MODE}).`);
    }
  }

  private onMainWindowClosed(): void {
    this.windowLogger.info("Main window closed.");
    this.mainWindow = null;
  }

  private onMainWindowReadyToShow(): void {
    this.windowLogger.info("Showing main window.");
    this.mainWindow?.show();
  }

  private onMainWindowWebContentsDidFinishLoad(): void {
    this.windowLogger.info("Loaded main window web contents.");
  }

  private onMainWindowWebContentsDidFailLoad(): void {
    this.windowLogger.info("Could not load main window web contents. Quitting app.");
    app.quit();
  }

  private developerToolsGlobalShortcutCallback(): void {
    this.windowLogger.info("Developer tools shortcut pressed.");
    if (this.mainWindow !== null) {
      this.windowLogger.debug("Opening developer tools.");
      this.mainWindow.webContents.openDevTools({ mode: "detach" });
      this.windowLogger.debug("Opened developer tools.");
    } else {
      this.windowLogger.debug("Main window is null. No-op.");
    }
  }

  private mainWindowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
    this.windowLogger.info(`Running main window open handler for external URL: ${details.url}.`);
    shell
      .openExternal(details.url)
      .then(() => {
        this.windowLogger.info(`Opened external URL: ${details.url}`);
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.windowLogger.info(`Could not open external URL (${details.url}): ${errorMessage}.`);
      });
    return { action: "deny" };
  }

  private onAppReady(): void {
    this.appLogger.info("App ready.");
    this.createMainWindow();
    this.appLogger.debug("Registering app activate event handler.");
    app.on("activate", () => {
      this.onAppActivate();
    });
    this.appLogger.debug("Registering IPC main event handlers.");
    ipcMain.on("new-user-storage", () => {
      this.onIPCMainNewUserStorage();
    });
  }

  private onAppActivate(): void {
    this.appLogger.info("App activated.");
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }

  private onAppWindowAllClosed(): void {
    this.appLogger.info("All app windows closed.");
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onAppWillQuit(): void {
    this.appLogger.info("App will quit.");
    this.appLogger.debug("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    this.appLogger.debug("Unregistered all global shortcuts.");
    this.appLogger.info("Checking for active user storage.");
    if (this.userStorage !== null) {
      this.appLogger.info("Found active user storage. Closing...");
      this.userStorage.close();
      this.appLogger.info("Closed user storage.");
    }
  }

  private onIPCMainNewUserStorage(): void {
    this.userStorageLogger.info("New user storage command received by main.");
    const DB_DIR_PATH: string = resolve(join(app.getAppPath(), "data"));
    const DB_FILE_NAME = "users.sqlite";
    this.userStorage = new SQLiteUserStorage(DB_DIR_PATH, DB_FILE_NAME, this.userStorageLogger);
  }
}
