import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { UserStorageType, UserStorageConfig } from "../shared/user/storage/types";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createJSONValidateFunction, readConfigJSON, writeConfigJSON } from "./utils/configUtils";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { ValidateFunction } from "ajv";
import { adjustWindowBounds, WindowPosition } from "./utils/windowUtils";
import { UserAccountManagerIPCChannel } from "./utils/IPCChannels";
import { UserAccountManager } from "./user/UserAccountManager";

export interface AppConfig {
  window: {
    position: Rectangle | WindowPosition.FullScreen | WindowPosition.Maximized;
  };
}

export class App {
  private static instance: null | App = null;

  // Resources
  private readonly ICON_FILE_PATH: string = resolve(join(app.getAppPath(), "resources", "icon.png"));
  private readonly INDEX_HTML_FILE_PATH: string = resolve(join(__dirname, "..", "renderer", "index.html"));

  // Logging
  private readonly LOGS_DIR_PATH: string = resolve(join(app.getAppPath(), "logs"));
  private readonly LOG_FILE_NAME = "BlackBoxLogs.log";
  private readonly LOG_FILE_PATH: string = resolve(join(this.LOGS_DIR_PATH, this.LOG_FILE_NAME));

  private readonly bootstrapLogger: LogFunctions = log.scope("main-bootstrap");
  private readonly appLogger: LogFunctions = log.scope("main-app");
  private readonly windowLogger: LogFunctions = log.scope("main-window");
  private readonly IPCLogger: LogFunctions = log.scope("main-ipc");
  private readonly userAccountManagerLogger: LogFunctions = log.scope("main-user-account-manager");

  // Config
  private readonly CONFIG_DIR_PATH: string = resolve(join(app.getAppPath(), "config"));
  private readonly CONFIG_FILE_NAME: string = "BlackBoxConfig.json";
  private readonly CONFIG_FILE_PATH: string = resolve(join(this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME));

  private readonly CONFIG_SCHEMA: JSONSchemaType<AppConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      window: {
        type: "object",
        properties: {
          position: {
            anyOf: [
              { type: "string", enum: [WindowPosition.FullScreen, WindowPosition.Maximized] },
              {
                // Electron Rectangle schema
                type: "object",
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number" },
                  height: { type: "number" }
                },
                required: ["x", "y", "width", "height"],
                additionalProperties: false
              }
            ]
          }
        },
        required: ["position"],
        additionalProperties: false
      }
    },
    required: ["window"],
    additionalProperties: false
  };

  private readonly DEFAULT_CONFIG: AppConfig = {
    window: {
      position: {
        x: 510,
        y: 185,
        width: 900,
        height: 670
      }
    }
  };

  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<AppConfig> = createJSONValidateFunction<AppConfig>(this.CONFIG_SCHEMA);
  private config: AppConfig = this.DEFAULT_CONFIG;

  // User account manager
  private userAccountManager: UserAccountManager = UserAccountManager.getInstance(this.userAccountManagerLogger);

  private readonly USER_STORAGE_CONFIG: UserStorageConfig = {
    type: UserStorageType.SQLite,
    dbDirPath: resolve(join(app.getAppPath(), "data")),
    dbFileName: "users.sqlite"
  };

  // Window
  private readonly WINDOW_CONSTRUCTOR_OPTIONS: BrowserWindowConstructorOptions = {
    show: false,
    icon: nativeImage.createFromPath(this.ICON_FILE_PATH),
    webPreferences: {
      preload: resolve(join(__dirname, "..", "preload", "preload.js")),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      allowRunningInsecureContent: false
    }
  };

  private window: null | BrowserWindow = null;

  // Timeouts
  private updateWindowPositionConfigTimeout: null | NodeJS.Timeout = null;
  private readonly UPDATE_WINDOW_POSITION_CONFIG_DELAY_MS = 500;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialise electron-log
    log.initialize();
    log.transports.file.resolvePathFn = () => {
      return this.LOG_FILE_PATH;
    };
    // Override all console functions with electron-log functions
    Object.assign(console, log.functions);
    log.errorHandler.startCatching();
    log.eventLogger.startLogging();
    // Create path to log file
    if (!existsSync(this.LOGS_DIR_PATH)) {
      mkdirSync(this.LOGS_DIR_PATH, { recursive: true });
    }
    // Add start log separator (also create file if missing)
    appendFileSync(this.LOG_FILE_PATH, `---------- Start : ${new Date().toISOString()} ----------\n`, "utf-8");
    this.bootstrapLogger.info(`Using log file at path: "${log.transports.file.getFile().path}".`);
    // Read app config
    try {
      this.config = readConfigJSON<AppConfig>(this.CONFIG_FILE_PATH, this.CONFIG_VALIDATE_FUNCTION, this.appLogger);
    } catch {
      this.appLogger.warn("Using default app config.");
      this.config = this.DEFAULT_CONFIG;
    }
    this.appLogger.debug(`Using app config: ${JSON.stringify(this.config, null, 2)}.`);
    this.bootstrapLogger.debug("App constructor done.");
  }

  public run(): void {
    this.bootstrapLogger.info("Running App.");
    this.bootstrapLogger.debug("Registering app event handlers.");
    app.once("ready", () => {
      this.onceAppReady();
    });
    app.on("window-all-closed", () => {
      this.onAppWindowAllClosed();
    });
    app.once("will-quit", () => {
      this.onceAppWillQuit();
    });
  }

  public static getInstance(): App {
    if (App.instance === null) {
      App.instance = new App();
    }
    return App.instance;
  }

  private createWindow(): void {
    this.windowLogger.info("Creating window.");
    // Read window config
    // This should allow config file edits on macOS to take effect when activating app
    try {
      this.config.window = readConfigJSON<AppConfig>(this.CONFIG_FILE_PATH, this.CONFIG_VALIDATE_FUNCTION, this.windowLogger).window;
    } catch {
      this.windowLogger.warn("Using default window config.");
      this.config.window = this.DEFAULT_CONFIG.window;
    }
    this.windowLogger.debug(`Using window config: ${JSON.stringify(this.config.window, null, 2)}.`);
    // Adjust bounds if the window positions are a Rectangle
    if (this.config.window.position !== WindowPosition.FullScreen && this.config.window.position !== WindowPosition.Maximized) {
      this.windowLogger.debug("Adjusting window bounds.");
      const PRIMARY_DISPLAY_BOUNDS: Rectangle = screen.getPrimaryDisplay().workArea;
      this.windowLogger.debug(`Primary display work area bounds: ${JSON.stringify(PRIMARY_DISPLAY_BOUNDS, null, 2)}.`);
      this.config.window.position = adjustWindowBounds(PRIMARY_DISPLAY_BOUNDS, this.config.window.position, this.windowLogger);
      this.windowLogger.debug(`Adjusted window positions: ${JSON.stringify(this.config.window.position, null, 2)}.`);
    }
    // Initialise window
    if (this.config.window.position === WindowPosition.FullScreen || this.config.window.position === WindowPosition.Maximized) {
      this.window = new BrowserWindow(this.WINDOW_CONSTRUCTOR_OPTIONS);
      if (this.config.window.position === WindowPosition.FullScreen) {
        this.window.setFullScreen(true);
      } else {
        this.window.maximize();
      }
    } else {
      this.window = new BrowserWindow({ ...this.WINDOW_CONSTRUCTOR_OPTIONS, ...this.config.window.position });
    }
    this.window.setMenuBarVisibility(false);
    this.windowLogger.debug("Created window.");
    this.windowLogger.debug("Registering window event handlers.");
    this.window.once("closed", () => {
      this.onceWindowClosed();
    });
    this.window.once("ready-to-show", () => {
      this.onceWindowReadyToShow();
    });
    this.window.webContents.once("did-finish-load", () => {
      this.onceWindowWebContentsDidFinishLoad();
    });
    this.window.webContents.once("did-fail-load", () => {
      this.onceWindowWebContentsDidFailLoad();
    });
    this.window.webContents.setWindowOpenHandler((details) => {
      return this.windowOpenHandler(details);
    });
    this.windowLogger.debug("Registered window event handlers.");
    this.windowLogger.info("Selecting window web contents source.");
    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      this.windowLogger.info(`Loading window web contents from URL: "${process.env.ELECTRON_RENDERER_URL}".`);
      void this.window.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", () => {
        this.developerToolsGlobalShortcutCallback();
      });
    } else {
      this.windowLogger.info(`Loading window web contents from file at path: "${this.INDEX_HTML_FILE_PATH}".`);
      void this.window.loadFile(this.INDEX_HTML_FILE_PATH);
    }
    // Log dev tools shortcut registration
    // TODO: Investigate this
    const MODE: string = app.isPackaged ? "production" : "development" + " mode";
    if (isDevToolsShortcutRegistered) {
      this.windowLogger.debug(`Developer tools shortcut registered (${MODE}).`);
      this.windowLogger.debug("Registering window web contents developer tools event handlers.");
      this.window.webContents.on("devtools-opened", () => {
        this.onWindowWebContentsDeveloperToolsOpened();
      });
      this.window.webContents.on("devtools-closed", () => {
        this.onWindowWebContentsDeveloperToolsClosed();
      });
      this.windowLogger.debug("Registered window web contents developer tools event handlers.");
    } else {
      this.windowLogger.debug(`Developer tools shortcut not registered (${MODE}).`);
    }
  }

  private onceWindowClosed(): void {
    if (this.window === null) {
      this.windowLogger.debug('Window is null on "closed". No-op.');
      return;
    }
    this.windowLogger.info("Window closed.");
    writeConfigJSON(this.config, this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME, this.CONFIG_VALIDATE_FUNCTION, this.windowLogger);
    this.windowLogger.debug("Removing all listeners from window.");
    this.window.removeAllListeners();
    this.windowLogger.debug("Nullifying window.");
    this.window = null;
  }

  private onceWindowReadyToShow(): void {
    if (this.window === null) {
      this.windowLogger.debug('Window is null on "ready-to-show". No-op.');
      return;
    }
    this.windowLogger.info("Showing window.");
    this.window.show();
    // Register these here, because show triggers a "move" event
    this.window.on("move", () => {
      this.onWindowMove();
    });
    this.window.on("resize", () => {
      this.onWindowResize();
    });
  }

  private onWindowMove(): void {
    // Move events fire very often while the window is moving; Debouncing is required
    this.onWindowBoundsChanged();
  }

  private onWindowResize(): void {
    // Resize events fire very often while the window is resizing; Debouncing is required
    this.onWindowBoundsChanged();
  }

  private onWindowBoundsChanged(): void {
    // Debounce updates to config
    if (this.updateWindowPositionConfigTimeout !== null) {
      clearTimeout(this.updateWindowPositionConfigTimeout);
    }
    this.updateWindowPositionConfigTimeout = setTimeout(() => {
      this.updateWindowPositionConfig();
    }, this.UPDATE_WINDOW_POSITION_CONFIG_DELAY_MS);
  }

  private updateWindowPositionConfig(): void {
    this.windowLogger.debug("Updating window position config.");
    if (this.window === null) {
      this.windowLogger.silly("Window is null. No-op.");
      return;
    }
    if (this.window.isMinimized()) {
      // Ignore updates when window is minimized
      this.windowLogger.silly("Window minimized. Config unchanged.");
      return;
    }
    if (this.window.isFullScreen()) {
      this.config.window.position = WindowPosition.FullScreen;
    } else if (this.window.isMaximized()) {
      this.config.window.position = WindowPosition.Maximized;
    } else {
      this.config.window = {
        position: this.window.getBounds()
      };
    }
    this.windowLogger.silly(
      `Window position config after update: ${
        typeof this.config.window.position === "string"
          ? '"' + this.config.window.position + '"'
          : JSON.stringify(this.config.window.position, null, 2)
      }.`
    );
  }

  private onceWindowWebContentsDidFinishLoad(): void {
    this.windowLogger.info("Loaded window web contents.");
  }

  private onceWindowWebContentsDidFailLoad(): void {
    this.windowLogger.info("Could not load window web contents. Quitting app.");
    app.quit();
  }

  private onWindowWebContentsDeveloperToolsOpened(): void {
    this.windowLogger.info("Developer tools opened.");
  }

  private onWindowWebContentsDeveloperToolsClosed(): void {
    this.windowLogger.info("Developer tools closed.");
  }

  private developerToolsGlobalShortcutCallback(): void {
    this.windowLogger.info("Developer tools shortcut pressed.");
    if (this.window === null) {
      this.windowLogger.debug("Window is null. No-op.");
      return;
    }
    this.windowLogger.debug("Opening developer tools.");
    this.window.webContents.openDevTools({ mode: "detach" });
  }

  private windowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
    this.windowLogger.info(`Running window open handler for external URL: "${details.url}".`);
    shell
      .openExternal(details.url)
      .then(() => {
        this.windowLogger.info(`Opened external URL: "${details.url}"`);
      })
      .catch((err: unknown) => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.windowLogger.error(`Could not open external URL ("${details.url}"): ${ERROR_MESSAGE}.`);
      });
    return { action: "deny" };
  }

  private onceAppReady(): void {
    this.appLogger.info("App ready.");
    this.createWindow();
    this.appLogger.debug("Registering app activate event handler.");
    app.on("activate", () => {
      this.onAppActivate();
    });
    this.appLogger.debug("Registering IPC main event handlers.");
    this.registerIPCMainEventHandlers();
  }

  private onAppActivate(): void {
    this.appLogger.info("App activated.");
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
    if (this.window === null) {
      this.createWindow();
    }
  }

  private onAppWindowAllClosed(): void {
    this.appLogger.info("All app windows closed.");
    // Respect the OSX convention of having the application in memory even after all windows have been closed
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onceAppWillQuit(): void {
    this.appLogger.info("App will quit.");
    this.appLogger.debug("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    if (this.userAccountManager.isStorageInitialised()) {
      this.userAccountManager.closeStorage();
    } else {
      this.appLogger.debug("No initialised user storage.");
    }
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private registerIPCMainEventHandlers() {
    this.registerUserAccountManagerIPCHandlers();
  }

  private registerUserAccountManagerIPCHandlers(): void {
    this.appLogger.debug("Registering user account manager IPC handlers.");
    ipcMain.handle(UserAccountManagerIPCChannel.getStorageConfig, () => {
      return this.handleUserAccountManagerGetStorageConfig();
    });
    ipcMain.handle(UserAccountManagerIPCChannel.initialiseStorage, () => {
      return this.handleUserAccountManagerInitialiseStorage();
    });
    ipcMain.handle(UserAccountManagerIPCChannel.closeStorage, () => {
      return this.handleUserAccountManagerCloseStorage();
    });
  }

  private handleUserAccountManagerGetStorageConfig(): UserStorageConfig {
    this.IPCLogger.debug("Received user storage config request.");
    return this.USER_STORAGE_CONFIG;
  }

  private handleUserAccountManagerInitialiseStorage(): boolean {
    this.IPCLogger.debug("Received user storage initialisation request.");
    if (this.userAccountManager.isStorageInitialised()) {
      this.userAccountManagerLogger.debug("User storage already initialised.");
      return false;
    }
    try {
      this.userAccountManager.initialiseStorage(this.USER_STORAGE_CONFIG);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.userAccountManagerLogger.error(`Could not initialise user storage: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  private handleUserAccountManagerCloseStorage(): boolean | null {
    this.IPCLogger.debug("Received user storage closure request.");
    return this.userAccountManager.closeStorage();
  }
}
