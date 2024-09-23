import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen, IpcMainInvokeEvent } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createJSONValidateFunction, readConfigJSON, writeConfigJSON } from "./utils/config/config";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { ValidateFunction } from "ajv";
import { IPCEncryptionAPIIPCChannel, UserAPIIPCChannel } from "./utils/IPC/IPCChannels";
import { UserAccountManager } from "./user/UserAccountManager";
import { UserStorageConfig } from "./user/storage/utils";
import { UserStorageType } from "./user/storage/UserStorageType";
import { WindowPosition } from "./utils/window/WindowPosition";
import { adjustWindowBounds } from "./utils/window/adjustWindowBounds";
import { IpcMainEvent } from "electron";
import { IUserAPI } from "../shared/IPC/APIs/IUserAPI";
import { MainProcessIPCAPIHandlers } from "./utils/IPC/MainProcessIPCAPIHandlers";
import { IBaseNewUserData } from "../shared/user/IBaseNewUserData";
import { generateKeyPairSync, webcrypto } from "node:crypto";
import { IIPCEncryptionAPI } from "../shared/IPC/APIs/IIPCEncryptionAPI";
import { ISecuredNewUserData } from "./user/ISecuredNewUserData";
import { testAESKey } from "./utils/encryption/testAESKey";
import { insertLineBreaks } from "../shared/utils/insertNewLines";
import { bufferToArrayBuffer } from "./utils/typeConversions/bufferToArrayBuffer";
import { decryptJSON } from "./utils/encryption/decryptJSON";
import { IEncryptedBaseNewUserData } from "../shared/user/encrypted/IEncryptedBaseNewUserData";
import { ICurrentlySignedInUser } from "../shared/user/ICurrentlySignedInUser";
import { IUserSignInCredentials } from "../shared/user/IUserSignInCredentials";
import { IEncryptedUserSignInCredentials } from "../shared/user/encrypted/IEncryptedUserSignInCredentials";
import { IPCAPIResponse } from "../shared/IPC/IPCAPIResponse";
import { IPCAPIResponseStatus } from "../shared/IPC/IPCAPIResponseStatus";

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
  private readonly IPCUserAPILogger: LogFunctions = log.scope("main-ipc-user-api");
  private readonly IPCEncryptionAPILogger: LogFunctions = log.scope("main-ipc-encryption-api");
  private readonly userAccountManagerLogger: LogFunctions = log.scope("main-user-account-manager");
  private readonly userStorageLogger: LogFunctions = log.scope("main-user-storage");

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

  // Will get initialised in the class constructor
  private readonly MAIN_PROCESS_PUBLIC_RSA_KEY_DER: Buffer;
  private readonly MAIN_PROCESS_PRIVATE_RSA_KEY_DER: Buffer;

  // Renderer process will send this over when it is ready
  private rendererProcessAESKey: Buffer | null = null;

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

  // IPC API handlers
  private readonly IPC_ENCRYPTION_API_HANDLERS: MainProcessIPCAPIHandlers<IIPCEncryptionAPI> = {
    handleGetMainProcessPublicRSAKeyDER: (): IPCAPIResponse<ArrayBuffer> => {
      this.IPCEncryptionAPILogger.debug("Received main process public RSA key request.");
      try {
        return { status: IPCAPIResponseStatus.SUCCESS, data: bufferToArrayBuffer(this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get main process public RSA key (DER): ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSendRendererProcessWrappedAESKey: async (rendererProcessWrappedAESKey: ArrayBuffer): Promise<IPCAPIResponse> => {
      this.IPCEncryptionAPILogger.debug("Received renderer process AES key.");
      this.IPCEncryptionAPILogger.silly(
        `RSA-wrapped AES key received:\n${insertLineBreaks(Buffer.from(rendererProcessWrappedAESKey).toString("base64"))}\n.`
      );
      try {
        // Import the main process private RSA key...
        const MAIN_PROCESS_PRIVATE_RSA_KEY: CryptoKey = await webcrypto.subtle.importKey(
          "pkcs8",
          this.MAIN_PROCESS_PRIVATE_RSA_KEY_DER,
          { name: "RSA-OAEP", hash: "SHA-256" },
          true,
          ["unwrapKey"]
        );
        // ...and use it to unwrap the renderer process wrapped AES key...
        const RENDERER_PROCESS_UNWRAPPED_AES_KEY: CryptoKey = await webcrypto.subtle.unwrapKey(
          "raw",
          rendererProcessWrappedAESKey,
          MAIN_PROCESS_PRIVATE_RSA_KEY,
          { name: "RSA-OAEP" },
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        // ...then extract it to its corresponding variable...
        this.rendererProcessAESKey = Buffer.from(await webcrypto.subtle.exportKey("raw", RENDERER_PROCESS_UNWRAPPED_AES_KEY));
        // ...and check its validity
        if (!testAESKey(this.rendererProcessAESKey, this.IPCEncryptionAPILogger)) {
          throw new Error("AES key failed test");
        }
        return { status: IPCAPIResponseStatus.SUCCESS };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCEncryptionAPILogger.error(`Failed to unwrap or validate AES key: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "Failed encryption key validation" };
      }
    }
  };

  private readonly USER_API_HANDLERS: MainProcessIPCAPIHandlers<IUserAPI> = {
    handleSignUp: (encryptedBaseNewUserData: IEncryptedBaseNewUserData): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug(`Received sign up request.`);
      try {
        if (this.rendererProcessAESKey === null) {
          throw new Error("Null renderer process AES encryption key");
        }
        const BASE_NEW_USER_DATA: IBaseNewUserData = decryptJSON<IBaseNewUserData>(
          encryptedBaseNewUserData,
          this.userAccountManager.BASE_NEW_USER_DATA_VALIDATE_FUNCTION,
          this.rendererProcessAESKey,
          this.IPCUserAPILogger,
          "base new user data"
        );
        const SECURED_NEW_USER_DATA: ISecuredNewUserData = this.userAccountManager.secureBaseNewUserData(BASE_NEW_USER_DATA);
        return {
          status: IPCAPIResponseStatus.SUCCESS,
          data: this.userAccountManager.signUpUser(SECURED_NEW_USER_DATA)
        };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign up user: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignIn: (encryptedUserSignInCredentials: IEncryptedUserSignInCredentials): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received sign in request.");
      try {
        if (this.rendererProcessAESKey === null) {
          throw new Error("Null renderer process AES key.");
        }
        const DECRYPTED_USER_SIGN_IN_CREDENTIALS: IUserSignInCredentials = decryptJSON<IUserSignInCredentials>(
          encryptedUserSignInCredentials,
          this.userAccountManager.USER_SIGN_IN_CREDENTIALS_VALIDATE_FUNCTION,
          this.rendererProcessAESKey,
          this.IPCUserAPILogger,
          "user sign in credentials"
        );
        return { status: IPCAPIResponseStatus.SUCCESS, data: this.userAccountManager.signInUser(DECRYPTED_USER_SIGN_IN_CREDENTIALS) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign in user: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse => {
      this.IPCUserAPILogger.debug("Received sign out request.");
      try {
        this.userAccountManager.signOutUser();
        return { status: IPCAPIResponseStatus.SUCCESS };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign out user: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsStorageAvailable: (): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received user storage availability status request.");
      try {
        const IS_STORAGE_AVAILABLE: boolean = this.userAccountManager.isUserStorageAvailable();
        this.IPCUserAPILogger.debug(`User storage available: ${IS_STORAGE_AVAILABLE.toString()}.`);
        return { status: IPCAPIResponseStatus.SUCCESS, data: IS_STORAGE_AVAILABLE };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get user storage availability: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received username availability status request.");
      try {
        return { status: IPCAPIResponseStatus.SUCCESS, data: this.userAccountManager.isUsernameAvailable(username) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get username availability: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      this.IPCUserAPILogger.debug("Received user count request.");
      try {
        return { status: IPCAPIResponseStatus.SUCCESS, data: this.userAccountManager.getUserCount() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get user count: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
      this.IPCUserAPILogger.debug("Received currently signed in user request.");
      try {
        return { status: IPCAPIResponseStatus.SUCCESS, data: this.userAccountManager.getCurrentlySignedInUser() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get currently signed in user: ${ERROR_MESSAGE}!`);
        return { status: IPCAPIResponseStatus.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendUserStorageAvailabilityChange: (isAvailable: boolean): void => {
      this.IPCUserAPILogger.debug(`Sending window user storage availability after change: ${isAvailable.toString()}.`);
      if (this.window === null) {
        this.IPCUserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.window.webContents.send(UserAPIIPCChannel.onUserStorageAvailabilityChange, isAvailable);
    },
    sendCurrentlySignedInUserChange: (newSignedInUser: ICurrentlySignedInUser | null): void => {
      this.IPCUserAPILogger.debug(`Sending window currently signed in user after change: ${JSON.stringify(newSignedInUser, null, 2)}.`);
      if (this.window === null) {
        this.IPCUserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.window.webContents.send(UserAPIIPCChannel.onCurrentlySignedInUserChange, newSignedInUser);
    }
  };

  // User account manager
  private userAccountManager: UserAccountManager = new UserAccountManager(
    this.USER_API_HANDLERS.sendCurrentlySignedInUserChange,
    this.USER_API_HANDLERS.sendUserStorageAvailabilityChange,
    this.userAccountManagerLogger,
    this.userStorageLogger
  );

  private readonly USER_STORAGE_CONFIG: UserStorageConfig = {
    type: UserStorageType.SQLite,
    dbDirPath: resolve(join(app.getAppPath(), "data")),
    dbFileName: "users.sqlite"
  };

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
      this.config = readConfigJSON<AppConfig>(this.CONFIG_FILE_PATH, this.CONFIG_VALIDATE_FUNCTION, this.bootstrapLogger);
    } catch {
      this.bootstrapLogger.warn("Using default app config.");
      this.config = this.DEFAULT_CONFIG;
    }
    this.bootstrapLogger.debug(`Using app config: ${JSON.stringify(this.config, null, 2)}.`);
    // Generate IPC encryption keys
    this.bootstrapLogger.debug(`Generating main process RSA encryption keys.`);
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: { type: "spki", format: "der" },
      privateKeyEncoding: { type: "pkcs8", format: "der" }
    });
    this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER = publicKey;
    this.MAIN_PROCESS_PRIVATE_RSA_KEY_DER = privateKey;
    this.bootstrapLogger.debug(
      `Generated main process public RSA key:\n${insertLineBreaks(Buffer.from(this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER).toString("base64"))}\n.`
    );
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

    // TEMPORARY
    // setInterval(() => {
    //   if (this.userAccountManager.isStorageAvailable()) {
    //     this.appLogger.warn("CLOSING USER STORAGE");
    //     this.userAccountManager.closeStorage();
    //   }
    // }, 10_000);
    // setTimeout(() => {
    //   setInterval(() => {
    //     if (!this.userAccountManager.isStorageAvailable()) {
    //       this.appLogger.warn("OPENING USER STORAGE");
    //       this.userAccountManager.initialiseStorage(this.USER_STORAGE_CONFIG);
    //     }
    //   }, 10_000);
    // }, 5_000);
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
      .then(
        (): void => {
          this.windowLogger.info(`Opened external URL: "${details.url}".`);
        },
        (reason: unknown): void => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          this.windowLogger.error(`Could not open external URL ("${details.url}"). Reason: ${REASON_MESSAGE}.`);
        }
      )
      .catch((err: unknown): void => {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.windowLogger.error(`Could not open external URL ("${details.url}"): ${ERROR_MESSAGE}.`);
      });
    return { action: "deny" };
  }

  private onceAppReady(): void {
    this.appLogger.info("App ready.");
    this.openUserStorage();
    this.createWindow();
    this.appLogger.debug("Registering app activate event handler.");
    app.on("activate", () => {
      this.onAppActivate();
    });
    this.appLogger.debug("Registering IPC main handlers.");
    this.registerIPCMainHandlers();
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
    if (this.userAccountManager.isUserStorageAvailable()) {
      this.appLogger.info(`Closing "${this.userAccountManager.getUserStorageType()}" user storage.`);
      const IS_USER_STORAGE_CLOSED: boolean = this.userAccountManager.closeUserStorage();
      this.appLogger.debug(IS_USER_STORAGE_CLOSED ? "Closed user storage." : "Could not close user storage.");
    } else {
      this.appLogger.debug("No initialised user storage.");
    }
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private openUserStorage(): boolean {
    this.userAccountManagerLogger.debug("Opening user storage.");
    if (this.userAccountManager.isUserStorageAvailable()) {
      this.userAccountManagerLogger.debug("User storage already opened.");
      return false;
    }
    try {
      this.userAccountManager.openUserStorage(this.USER_STORAGE_CONFIG);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.userAccountManagerLogger.error(`Could not open user storage: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  private registerIPCMainHandlers(): void {
    this.IPCLogger.debug("Registering IPC API handlers.");
    this.registerIPCEncryptionAPIIPCHandlers();
    this.registerUserAPIIPCHandlers();
  }

  private registerIPCEncryptionAPIIPCHandlers(): void {
    this.IPCLogger.debug("Registering IPC Encryption API IPC handlers.");
    ipcMain.on(IPCEncryptionAPIIPCChannel.getMainProcessPublicRSAKeyDER, (event: IpcMainEvent): void => {
      event.returnValue = this.IPC_ENCRYPTION_API_HANDLERS.handleGetMainProcessPublicRSAKeyDER();
    });
    ipcMain.handle(
      IPCEncryptionAPIIPCChannel.sendRendererProcessWrappedAESKey,
      (_: IpcMainInvokeEvent, rendererProcessWrappedAESKey: ArrayBuffer): IPCAPIResponse | Promise<IPCAPIResponse> => {
        return this.IPC_ENCRYPTION_API_HANDLERS.handleSendRendererProcessWrappedAESKey(rendererProcessWrappedAESKey);
      }
    );
  }

  private registerUserAPIIPCHandlers(): void {
    this.IPCLogger.debug("Registering User API IPC handlers.");
    ipcMain.on(UserAPIIPCChannel.isStorageAvailable, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleIsStorageAvailable();
    });
    ipcMain.on(UserAPIIPCChannel.isUsernameAvailable, (event: IpcMainEvent, username: string): void => {
      event.returnValue = this.USER_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(UserAPIIPCChannel.signUp, (event: IpcMainEvent, encryptedBaseNewUserData: IEncryptedBaseNewUserData): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignUp(encryptedBaseNewUserData);
    });
    ipcMain.on(UserAPIIPCChannel.getUserCount, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(UserAPIIPCChannel.signIn, (event: IpcMainEvent, encryptedUserSignInCredentials: IEncryptedUserSignInCredentials): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignIn(encryptedUserSignInCredentials);
    });
    ipcMain.on(UserAPIIPCChannel.signOut, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(UserAPIIPCChannel.getCurrentlySignedInUser, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleGetCurrentlySignedInUser();
    });
  }
}
