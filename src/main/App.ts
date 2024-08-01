import { app, globalShortcut, BrowserWindow, ipcMain } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { UserAccountManager } from "./user/userAccountManager/UserAccountManager";
import { userAccountManagerFactory, UserAccountManagerConfig } from "./user/userAccountManager/userAccountManagerFactory";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { UserAccountManagerType } from "./user/userAccountManager/UserAccountManagerType";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { ConfigManager } from "./config/ConfigManager";
import { JSONSchemaType } from "ajv/dist/types/json-schema";

export interface AppConfig {
  windowOptions: {
    width: number;
    height: number;
  };
}

export class App {
  private static instance: null | App = null;

  private isElectronLogInitialised = false; // This exists to make sure electron-log initialisation is done only once

  private readonly ICON_FILE_PATH: string = resolve(join(app.getAppPath(), "resources", "icon.png"));

  private readonly LOGS_DIR_PATH: string = resolve(join(app.getAppPath(), "logs"));
  private readonly LOG_FILE_NAME = "BlackBoxLogs.log";
  private readonly LOG_FILE_PATH: string = resolve(join(this.LOGS_DIR_PATH, this.LOG_FILE_NAME));

  private readonly CONFIG_DIR_PATH: string = resolve(join(app.getAppPath(), "config"));
  private readonly CONFIG_FILE_NAME: string = "BlackBoxConfig.json";

  private configManager: null | ConfigManager<AppConfig> = null;
  private mainWindow: null | BrowserWindow = null;
  private userAccountManager: null | UserAccountManager<UserAccountManagerConfig> = null;

  private bootstrapLogger: LogFunctions;
  private appLogger: LogFunctions;
  private configLoaderLogger: LogFunctions;
  private windowLogger: LogFunctions;
  private userAccountManagerLogger: LogFunctions;

  private readonly CONFIG_SCHEMA: JSONSchemaType<AppConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      windowOptions: {
        type: "object",
        properties: {
          width: {
            type: "number"
          },
          height: {
            type: "number"
          }
        },
        required: ["width", "height"],
        additionalProperties: false
      }
    },
    required: ["windowOptions"],
    additionalProperties: false
  };

  private readonly DEFAULT_CONFIG: AppConfig = {
    windowOptions: {
      width: 900,
      height: 670
    }
  };

  private config: AppConfig;

  private readonly MAIN_WINDOW_CONSTRUCTOR_OPTIONS: BrowserWindowConstructorOptions = {
    show: false,
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(this.ICON_FILE_PATH),
    webPreferences: {
      preload: resolve(join(__dirname, "..", "preload", "preload.js")),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      allowRunningInsecureContent: false
    }
  };

  // Private constructor to prevent direct instantiation
  private constructor() {
    let wasElectronLogInitialisedNow: boolean;
    let wasLogFilePathCreatedNow: boolean | null;
    let wasLogFileCreatedNow: boolean | null;
    // Initialise electron-log only once per app lifecycle
    if (!this.isElectronLogInitialised) {
      [wasLogFilePathCreatedNow, wasLogFileCreatedNow] = this.initialiseElectronLog();
      this.isElectronLogInitialised = true;
      wasElectronLogInitialisedNow = true;
    } else {
      wasLogFilePathCreatedNow = null;
      wasLogFileCreatedNow = null;
      wasElectronLogInitialisedNow = false;
    }
    // Initialise scoped loggers
    this.bootstrapLogger = log.scope("main-bootstrap");
    this.windowLogger = log.scope("main-browser-window");
    this.appLogger = log.scope("main-electron-app");
    this.configLoaderLogger = log.scope("main-app-config-loader");
    this.userAccountManagerLogger = log.scope("main-user-account-manager");
    // These are here to make sure I'm not insane
    this.bootstrapLogger.info("Running App constructor.");
    if (wasElectronLogInitialisedNow) {
      this.bootstrapLogger.debug("Electron-log initialised.");
    } else {
      this.bootstrapLogger.debug("Electron-log was already initialised."); // This should never run if the App class is a proper singleton
    }
    if (wasLogFilePathCreatedNow !== null) {
      if (wasLogFilePathCreatedNow) {
        this.bootstrapLogger.debug("Log file directory path created.");
      } else {
        this.bootstrapLogger.debug("Log file directory path already existed.");
      }
    }
    if (wasLogFileCreatedNow !== null) {
      if (wasLogFileCreatedNow) {
        this.bootstrapLogger.debug("Log file created.");
      } else {
        this.bootstrapLogger.debug("Log file already existed.");
      }
    }
    this.bootstrapLogger.info(`Using log file at path: "${log.transports.file.getFile().path}".`);
    // Initialise config manager
    try {
      this.configManager = new ConfigManager<AppConfig>(this.CONFIG_SCHEMA, this.DEFAULT_CONFIG, this.configLoaderLogger);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.windowLogger.error(`Could not initialise Config Manager: ${errorMessage}!`);
    }
    // Read config
    try {
      if (this.configManager !== null) {
        this.config = this.configManager.readJSON(this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME);
      } else {
        this.config = this.DEFAULT_CONFIG;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.windowLogger.error(`Could not read config: ${errorMessage}! Using default config.`);
      this.config = this.DEFAULT_CONFIG;
    }
  }

  public run(): void {
    this.bootstrapLogger.info("Running App.");
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

  private initialiseElectronLog(): [boolean, boolean] {
    log.initialize();
    // Create path to log file if required
    let wasLogFileDirPathCreatedNow: boolean;
    if (existsSync(this.LOGS_DIR_PATH)) {
      wasLogFileDirPathCreatedNow = false;
    } else {
      mkdirSync(this.LOGS_DIR_PATH, { recursive: true });
      wasLogFileDirPathCreatedNow = true;
    }
    // Determine log file existence
    let wasLogFileCreatedNow: boolean;
    if (existsSync(this.LOG_FILE_PATH)) {
      wasLogFileCreatedNow = false;
    } else {
      wasLogFileCreatedNow = true;
    }
    // Add start log separator (also create file if required)
    appendFileSync(this.LOG_FILE_PATH, `---------- Start : ${new Date().toISOString()} ----------\n`, "utf-8");
    log.transports.file.resolvePathFn = () => {
      return this.LOG_FILE_PATH;
    };
    // Override all console functions with electron-log functions
    Object.assign(console, log.functions);
    log.errorHandler.startCatching();
    log.eventLogger.startLogging();
    return [wasLogFileDirPathCreatedNow, wasLogFileCreatedNow];
  }

  private createMainWindow(): void {
    this.windowLogger.info("Creating main window.");
    this.mainWindow = new BrowserWindow({ ...this.MAIN_WINDOW_CONSTRUCTOR_OPTIONS, ...this.config.windowOptions });
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
    this.windowLogger.info("Selecting main window web contents source.");
    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      this.windowLogger.info(`Loading main window web contents from URL: "${process.env.ELECTRON_RENDERER_URL}".`);
      void this.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", () => {
        this.developerToolsGlobalShortcutCallback();
      });
    } else {
      const INDEX_HTML_FILE_PATH: string = join(__dirname, "..", "renderer", "index.html");
      this.windowLogger.info(`Loading main window web contents from file at path: "${INDEX_HTML_FILE_PATH}".`);
      void this.mainWindow.loadFile(INDEX_HTML_FILE_PATH);
    }
    // Log dev tools shortcut registration
    // TODO: Investigate this
    const MODE: string = app.isPackaged ? "production" : "development" + " mode";
    if (isDevToolsShortcutRegistered) {
      this.windowLogger.debug(`Developer tools shortcut registered (${MODE}).`);
      this.windowLogger.debug("Registering main window web contents developer tools event handlers.");
      this.mainWindow.webContents.on("devtools-opened", () => {
        this.onMainWindowWebContentsDeveloperToolsOpened();
      });
      this.mainWindow.webContents.on("devtools-closed", () => {
        this.onMainWindowWebContentsDeveloperToolsClosed();
      });
      this.windowLogger.debug("Registered main window web contents developer tools event handlers.");
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

  private onMainWindowWebContentsDeveloperToolsOpened(): void {
    this.windowLogger.info("Developer tools opened.");
  }

  private onMainWindowWebContentsDeveloperToolsClosed(): void {
    this.windowLogger.info("Developer tools closed.");
  }

  private developerToolsGlobalShortcutCallback(): void {
    this.windowLogger.info("Developer tools shortcut pressed.");
    if (this.mainWindow !== null) {
      this.windowLogger.debug("Opening developer tools.");
      this.mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      this.windowLogger.debug("Main window is null. No-op.");
    }
  }

  private mainWindowOpenHandler(details: HandlerDetails): WindowOpenHandlerResponse {
    this.windowLogger.info(`Running main window open handler for external URL: "${details.url}".`);
    shell
      .openExternal(details.url)
      .then(() => {
        this.windowLogger.info(`Opened external URL: "${details.url}"`);
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.windowLogger.error(`Could not open external URL ("${details.url}"): ${errorMessage}.`);
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
    ipcMain.on("new-user-account-manager", () => {
      this.onIPCMainNewUserAccountManager();
    });
  }

  private onAppActivate(): void {
    this.appLogger.info("App activated.");
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open
    if (this.mainWindow === null) {
      this.createMainWindow();
    }
  }

  private onAppWindowAllClosed(): void {
    this.appLogger.info("All app windows closed.");
    // Respect the OSX convention of having the application in memory even after all windows have been closed
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onAppWillQuit(): void {
    this.appLogger.info("App will quit.");
    this.appLogger.debug("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    this.appLogger.debug("Unregistered all global shortcuts.");
    this.configManager?.writeJSON(this.config, this.CONFIG_DIR_PATH, this.CONFIG_FILE_NAME);
    this.appLogger.debug("Checking for initialised User Account Manager.");
    if (this.userAccountManager !== null) {
      this.appLogger.debug(`Found initialised "${this.userAccountManager.config.type}" User Account Manager.`);
      this.userAccountManager.close();
      this.appLogger.debug("Closed user account manager.");
    } else {
      this.appLogger.debug("No initialised User Account Manager.");
    }
    this.appLogger.silly("Pre-quit steps done. Appending end log separator to log file.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private onIPCMainNewUserAccountManager(): void {
    this.userAccountManagerLogger.info("New user account manager command received by main.");
    const USER_ACCOUNT_MANAGER_CONFIG: UserAccountManagerConfig = {
      type: UserAccountManagerType.SQLite,
      dbDirPath: resolve(join(app.getAppPath(), "data")),
      dbFileName: "users.sqlite"
    };
    try {
      this.userAccountManager = userAccountManagerFactory(USER_ACCOUNT_MANAGER_CONFIG, this.userAccountManagerLogger);
      this.mainWindow?.webContents.send("created-user-account-manager");
    } catch (err: unknown) {
      this.userAccountManager = null;
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.appLogger.error(
        `Error: ${errorMessage}!\nCould not create user account manager with given config: ${JSON.stringify(USER_ACCOUNT_MANAGER_CONFIG, null, 2)}.`
      );
      this.mainWindow?.webContents.send("failed-creating-user-account-manager");
    }
  }
}
