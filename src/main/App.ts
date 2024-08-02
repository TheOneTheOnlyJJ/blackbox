import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { AccountManager } from "./user/accountManager/AccountManager";
import { accountManagerFactory, AccountManagerConfig } from "./user/accountManager/accountManagerFactory";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { AccountManagerType } from "./user/accountManager/AccountManagerType";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { ConfigManager } from "./config/ConfigManager";
import { JSONSchemaType } from "ajv/dist/types/json-schema";

export interface AppConfig {
  window: {
    position: Rectangle | "fullscreen" | "maximized";
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
  private readonly windowLogger: LogFunctions = log.scope("main-window");
  private readonly appLogger: LogFunctions = log.scope("main-app");
  private readonly configLoaderLogger: LogFunctions = log.scope("main-config-loader");
  private readonly accountManagerLogger: LogFunctions = log.scope("main-account-manager");

  // Config
  private readonly CONFIG_DIR_PATH: string = resolve(join(app.getAppPath(), "config"));
  private readonly CONFIG_FILE_NAME: string = "BlackBoxConfig.json";

  private readonly CONFIG_SCHEMA: JSONSchemaType<AppConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      window: {
        type: "object",
        properties: {
          position: {
            anyOf: [
              { type: "string", enum: ["fullscreen", "maximized"] },
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

  private configManager: ConfigManager<AppConfig>;
  private config: AppConfig = this.DEFAULT_CONFIG;

  // User account manager
  private accountManager: null | AccountManager<AccountManagerConfig> = null;

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

  // Timers
  private updateWindowPositionConfigTimer: null | NodeJS.Timeout = null;
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
    // Log something to make sure it works
    this.bootstrapLogger.info("Running App constructor.");
    this.bootstrapLogger.info(`Using log file at path: "${log.transports.file.getFile().path}".`);
    // Initialise config manager
    try {
      this.configManager = new ConfigManager<AppConfig>(this.CONFIG_SCHEMA, this.DEFAULT_CONFIG, this.configLoaderLogger);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.windowLogger.error(`Could not initialise Config Manager: ${ERROR_MESSAGE}!`);
      app.quit();
      // Stop TypeScript from bitching
      // Property 'configManager' has no initializer and is not definitely assigned in the constructor.ts(2564)
      process.exit();
    }
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
    this.bootstrapLogger.debug("Registered app event handlers.");
  }

  public static getInstance(): App {
    if (App.instance === null) {
      App.instance = new App();
    }
    return App.instance;
  }

  private createWindow(): void {
    this.windowLogger.info("Creating window.");
    // Read config
    try {
      this.config = this.configManager.readJSON(this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.windowLogger.error(`Could not read config: ${ERROR_MESSAGE}! Using default config.`);
      this.config = this.DEFAULT_CONFIG;
    }
    // Initialise window
    if (this.config.window.position === "fullscreen" || this.config.window.position === "maximized") {
      this.window = new BrowserWindow(this.WINDOW_CONSTRUCTOR_OPTIONS);
      if (this.config.window.position === "fullscreen") {
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
    this.windowLogger.info("Window closed.");
    this.configManager.writeJSON(this.config, this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME);
    this.window = null;
  }

  private onceWindowReadyToShow(): void {
    if (this.window === null) {
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
    // This event fires so often while the window is moving that it requires debouncing
    this.onWindowBoundsChanged();
  }

  private onWindowResize(): void {
    // This event fires so often while the window is resizing that it requires debouncing
    this.onWindowBoundsChanged();
  }

  private onWindowBoundsChanged(): void {
    // Debounce updates to config
    if (this.updateWindowPositionConfigTimer !== null) {
      clearTimeout(this.updateWindowPositionConfigTimer);
    }
    this.updateWindowPositionConfigTimer = setTimeout(() => {
      this.updateWindowPositionConfig();
    }, this.UPDATE_WINDOW_POSITION_CONFIG_DELAY_MS);
  }

  private updateWindowPositionConfig(): void {
    if (this.window === null) {
      return;
    }
    if (this.window.isMinimized()) {
      // Ignore updates when window is minimized
      return;
    }
    this.windowLogger.debug("Updating window position config.");
    if (this.window.isFullScreen()) {
      this.config.window.position = "fullscreen";
    } else if (this.window.isMaximized()) {
      this.config.window.position = "maximized";
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
    if (this.window !== null) {
      this.windowLogger.debug("Opening developer tools.");
      this.window.webContents.openDevTools({ mode: "detach" });
    } else {
      this.windowLogger.debug("Window is null. No-op.");
    }
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
    ipcMain.on("new-user-account-manager", () => {
      this.onIPCMainNewUserAccountManager();
    });
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
    this.appLogger.debug("Unregistered all global shortcuts.");
    this.appLogger.debug("Checking for initialised User Account Manager.");
    if (this.accountManager !== null) {
      this.appLogger.debug(`Found initialised "${this.accountManager.config.type}" User Account Manager.`);
      this.accountManager.close();
      this.appLogger.debug("Closed user account manager.");
    } else {
      this.appLogger.debug("No initialised User Account Manager.");
    }
    this.appLogger.silly("Pre-quit steps done. Appending end log separator to log file.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private onIPCMainNewUserAccountManager(): void {
    this.accountManagerLogger.info("New user account manager command received by main.");
    const USER_ACCOUNT_MANAGER_CONFIG: AccountManagerConfig = {
      type: AccountManagerType.SQLite,
      dbDirPath: resolve(join(app.getAppPath(), "data")),
      dbFileName: "users.sqlite"
    };
    try {
      this.accountManager = accountManagerFactory(USER_ACCOUNT_MANAGER_CONFIG, this.accountManagerLogger);
      this.window?.webContents.send("created-user-account-manager");
    } catch (err: unknown) {
      this.accountManager = null;
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.appLogger.error(
        `Error: ${ERROR_MESSAGE}!\nCould not create user account manager with given config: ${JSON.stringify(USER_ACCOUNT_MANAGER_CONFIG, null, 2)}.`
      );
      this.window?.webContents.send("failed-creating-user-account-manager");
    }
  }
}
