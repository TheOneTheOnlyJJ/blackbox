import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen, IpcMainInvokeEvent } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { IPC_TLS_API_IPC_CHANNELS, USER_API_IPC_CHANNELS } from "@main/utils/IPC/IPCChannels";
import { UserManager } from "@main/user/UserManager";
import { USER_ACCOUNT_STORAGE_TYPE } from "@main/user/account/storage/UserAccountStorageType";
import { adjustWindowBounds } from "@main/utils/window/adjustWindowBounds";
import { IpcMainEvent } from "electron";
import { IUserAPI } from "@shared/IPC/APIs/UserAPI";
import { MainProcessIPCAPIHandlers } from "@main/utils/IPC/MainProcessIPCAPIHandlers";
import { IUserSignUpData } from "@shared/user/account/UserSignUpData";
import { generateKeyPairSync, webcrypto } from "node:crypto";
import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { ISecuredUserSignUpData } from "@main/user/account/SecuredNewUserData";
import { testAESKey } from "@main/utils/encryption/testAESKey";
import { insertLineBreaks } from "@shared/utils/insertNewLines";
import { bufferToArrayBuffer } from "@main/utils/typeConversions/bufferToArrayBuffer";
import { decryptJSON } from "@main/utils/encryption/decryptJSON";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { IUserSignInData } from "@shared/user/account/UserSignInData";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { SettingsManager } from "@main/settings/SettingsManager";
import { SettingsManagerConfig, settingsManagerFactory } from "@main/settings/settingsManagerFactory";
import { SETTINGS_MANAGER_TYPE } from "@main/settings/SettingsManagerType";
import { WINDOW_STATES, WindowPosition, WindowPositionWatcher, WindowStates } from "@main/settings/WindowPositionWatcher";
import Ajv from "ajv";
import { UserAccountStorageConfig } from "@main/user/account/storage/UserAccountStorageConfig";
import { EncryptedUserDataStorageConfigWithMetadataInputData } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigWithMetadataInputData";
import { IUserDataStorageConfigWithMetadataInputData } from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";
import { userDataStorageConfigInputDataToUserDataStorageConfig } from "./user/data/storage/UserDataStorageConfigInputDataToUserDataStorageConfig";
import { UserDataStorageConfig } from "./user/data/storage/UserDataStorageConfig";

type WindowPositionSetting = Rectangle | WindowStates["FullScreen"] | WindowStates["Maximized"];

interface IWindowSettings {
  position: WindowPositionSetting;
}

export interface IAppSettings {
  window: IWindowSettings;
}

type MainProcessIPCTLSAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSAPI>;
type MainProcessUserAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserAPI>;

export class App {
  // Own singleton instance
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
  private readonly windowPositionWatcherLogger: LogFunctions = log.scope("main-window-position-watcher");
  private readonly settingsManagerLogger: LogFunctions = log.scope("main-settings-manager");
  private readonly IPCLogger: LogFunctions = log.scope("main-ipc");
  private readonly IPCUserAPILogger: LogFunctions = log.scope("main-ipc-user-api");
  private readonly IPCTLSAPILogger: LogFunctions = log.scope("main-ipc-tls-api");
  private readonly userManagerLogger: LogFunctions = log.scope("main-user-manager");
  private readonly userAccountStorageLogger: LogFunctions = log.scope("main-user-account-storage");

  // Settings
  public static readonly SETTINGS_SCHEMA: JSONSchemaType<IAppSettings> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      window: {
        type: "object",
        properties: {
          position: {
            // One of the accepted Window State options or Electron Rectangle
            anyOf: [
              // Accepted Window State options are only FullScreen and Maximized (notice absence of Minimized)
              { type: "string", enum: [WINDOW_STATES.FullScreen, WINDOW_STATES.Maximized] },
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
  private readonly DEFAULT_SETTINGS: IAppSettings = {
    window: {
      position: {
        x: 510,
        y: 185,
        width: 900,
        height: 670
      }
    }
  };
  private readonly settingsManager: SettingsManager<IAppSettings, SettingsManagerConfig>;
  private readonly SETTINGS_MANAGER_CONFIG: SettingsManagerConfig = {
    type: SETTINGS_MANAGER_TYPE.LocalJSON,
    fileDir: resolve(join(app.getAppPath(), "settings")),
    fileName: "BlackBoxSettings.json"
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
  private readonly windowPositionWatcher: WindowPositionWatcher;

  // Users
  private readonly userManager: UserManager;
  private readonly USER_ACCOUNT_STORAGE_CONFIG: UserAccountStorageConfig = {
    type: USER_ACCOUNT_STORAGE_TYPE.LocalSQLite,
    dbDirPath: resolve(join(app.getAppPath(), "data")),
    dbFileName: "users.sqlite"
  };

  // Security
  // Will get initialised in the class constructor
  private readonly MAIN_PROCESS_PUBLIC_RSA_KEY_DER: Buffer;
  private readonly MAIN_PROCESS_PRIVATE_RSA_KEY_DER: Buffer;
  // Renderer process will send this over when it is ready
  private rendererProcessAESKey: Buffer | null = null;

  // JSON Schema validator
  private readonly AJV: Ajv = new Ajv({ strict: true });

  // IPC API handlers
  private readonly IPC_TLS_API_HANDLERS: MainProcessIPCTLSAPIIPCHandlers = {
    handleGetMainProcessPublicRSAKeyDER: (): IPCAPIResponse<ArrayBuffer> => {
      this.IPCTLSAPILogger.debug("Received main process public RSA key request.");
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: bufferToArrayBuffer(this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get main process public RSA key (DER): ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSendRendererProcessWrappedAESKey: async (rendererProcessWrappedAESKey: ArrayBuffer): Promise<IPCAPIResponse> => {
      this.IPCTLSAPILogger.debug("Received renderer process AES key.");
      this.IPCTLSAPILogger.silly(
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
        if (!testAESKey(this.rendererProcessAESKey, this.IPCTLSAPILogger)) {
          throw new Error("AES key failed test");
        }
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCTLSAPILogger.error(`Failed to unwrap or validate AES key: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "Failed encryption key validation" };
      }
    }
  };

  private readonly USER_API_HANDLERS: MainProcessUserAPIIPCHandlers = {
    handleSignUp: (encryptedUserSignUpData: EncryptedUserSignUpData): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug(`Received sign up request.`);
      try {
        if (this.rendererProcessAESKey === null) {
          throw new Error("Null renderer process AES encryption key");
        }
        const USER_SIGN_UP_DATA: IUserSignUpData = decryptJSON<IUserSignUpData>(
          encryptedUserSignUpData,
          this.userManager.USER_SIGN_UP_DATA_VALIDATE_FUNCTION,
          this.rendererProcessAESKey,
          this.IPCUserAPILogger,
          "user sign up data"
        );
        this.appLogger.debug("Decrypted user sign up data.");
        const SECURED_USER_SIGN_UP_DATA: ISecuredUserSignUpData = this.userManager.secureBaseNewUserData(USER_SIGN_UP_DATA);
        this.appLogger.debug("Secured user sign up data.");
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.signUpUser(SECURED_USER_SIGN_UP_DATA)
        };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign up user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignIn: (encryptedUserSignInData: EncryptedUserSignInData): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received sign in request.");
      try {
        if (this.rendererProcessAESKey === null) {
          throw new Error("Null renderer process AES key.");
        }
        const DECRYPTED_USER_SIGN_IN_DATA: IUserSignInData = decryptJSON<IUserSignInData>(
          encryptedUserSignInData,
          this.userManager.USER_SIGN_IN_DATA_VALIDATE_FUNCTION,
          this.rendererProcessAESKey,
          this.IPCUserAPILogger,
          "user sign in data"
        );
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.signInUser(DECRYPTED_USER_SIGN_IN_DATA) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign in user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse => {
      this.IPCUserAPILogger.debug("Received sign out request.");
      try {
        this.userManager.signOutUser();
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not sign out user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsAccountStorageAvailable: (): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received User Account Storage availability status request.");
      try {
        const IS_STORAGE_AVAILABLE: boolean = this.userManager.isUserAccountStorageAvailable();
        this.IPCUserAPILogger.debug(`User Account Storage available: ${IS_STORAGE_AVAILABLE.toString()}.`);
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: IS_STORAGE_AVAILABLE };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get User Account Storage availability: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received username availability status request.");
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.isUsernameAvailable(username) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get username availability: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      this.IPCUserAPILogger.debug("Received user count request.");
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getUserCount() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get user count: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
      this.IPCUserAPILogger.debug("Received currently signed in user request.");
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getCurrentlySignedInUser() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not get currently signed in user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddNewUserDataStorageConfigWithMetadataToUser: (
      encryptedNewUserDataStorageConfigWithMetadataInputData: EncryptedUserDataStorageConfigWithMetadataInputData
    ): IPCAPIResponse<boolean> => {
      this.IPCUserAPILogger.debug("Received add new User Data Storage config with metadata request.");
      try {
        if (this.rendererProcessAESKey === null) {
          throw new Error("Null renderer process AES key.");
        }
        const DECRYPTED_NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA: IUserDataStorageConfigWithMetadataInputData =
          decryptJSON<IUserDataStorageConfigWithMetadataInputData>(
            encryptedNewUserDataStorageConfigWithMetadataInputData,
            this.userManager.USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_VALIDATE_FUNCTION,
            this.rendererProcessAESKey,
            this.IPCUserAPILogger,
            "User Data Storage config with metadata input data"
          );
        const NEW_USER_DATA_STORAGE_CONFIG: UserDataStorageConfig = userDataStorageConfigInputDataToUserDataStorageConfig(
          DECRYPTED_NEW_USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA.config,
          this.IPCUserAPILogger
        );
        this.IPCUserAPILogger.debug(`New User Data Storage config: ${JSON.stringify(NEW_USER_DATA_STORAGE_CONFIG, null, 2)}.`);
        // TODO: Implement this
        // TODO: Add user to add it to as a parameter
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: true };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.IPCUserAPILogger.error(`Could not add new User Data Storage config with metadata: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAccountStorageAvailabilityChange: (isUserAccountStorageAvailable: boolean): void => {
      this.IPCUserAPILogger.debug(`Sending window User Account Storage availability after change: "${isUserAccountStorageAvailable.toString()}".`);
      if (this.window === null) {
        this.IPCUserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.window.webContents.send(USER_API_IPC_CHANNELS.onAccountStorageAvailabilityChange, isUserAccountStorageAvailable);
    },
    sendCurrentlySignedInUserChange: (newSignedInUser: ICurrentlySignedInUser | null): void => {
      this.IPCUserAPILogger.debug(`Sending window currently signed in user after change: ${JSON.stringify(newSignedInUser, null, 2)}.`);
      if (this.window === null) {
        this.IPCUserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.window.webContents.send(USER_API_IPC_CHANNELS.onCurrentlySignedInUserChange, newSignedInUser);
    }
  };

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
    // Initialise required managers & watchers
    this.userManager = new UserManager(this.userManagerLogger, this.userAccountStorageLogger, this.AJV);
    this.userManager.onCurrentlySignedInUserChangeCallback = this.USER_API_HANDLERS.sendCurrentlySignedInUserChange;
    this.userManager.onUserAccountStorageAvailabilityChangeCallback = this.USER_API_HANDLERS.sendAccountStorageAvailabilityChange;
    this.settingsManager = settingsManagerFactory<IAppSettings>(
      this.SETTINGS_MANAGER_CONFIG,
      App.SETTINGS_SCHEMA,
      this.settingsManagerLogger,
      this.AJV
    );
    this.windowPositionWatcher = new WindowPositionWatcher(this.windowPositionWatcherLogger);
    // Read app settings
    try {
      this.settingsManager.updateSettings(this.settingsManager.fetchSettings());
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.bootstrapLogger.error(`Could not fetch app settings: ${ERROR_MESSAGE}!`);
      this.bootstrapLogger.warn("Using default app settings.");
      this.settingsManager.updateSettings(this.DEFAULT_SETTINGS);
    }
    this.bootstrapLogger.debug(`Using app settings: ${JSON.stringify(this.settingsManager.getSettings(), null, 2)}.`);
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
    // Read window settings
    // This should allow external settings edits on macOS to take effect when activating app
    let lastWindowSettings: IWindowSettings;
    try {
      lastWindowSettings = this.settingsManager.fetchSettings().window;
    } catch {
      this.windowLogger.warn("Using default window settings.");
      lastWindowSettings = this.DEFAULT_SETTINGS.window;
    }
    this.windowLogger.debug(`Using window settings: ${JSON.stringify(lastWindowSettings, null, 2)}.`);
    // Adjust bounds if the window positions are a Rectangle
    if (lastWindowSettings.position !== WINDOW_STATES.FullScreen && lastWindowSettings.position !== WINDOW_STATES.Maximized) {
      this.windowLogger.debug("Adjusting window bounds.");
      const PRIMARY_DISPLAY_BOUNDS: Rectangle = screen.getPrimaryDisplay().workArea;
      this.windowLogger.debug(`Primary display work area bounds: ${JSON.stringify(PRIMARY_DISPLAY_BOUNDS, null, 2)}.`);
      lastWindowSettings.position = adjustWindowBounds(PRIMARY_DISPLAY_BOUNDS, lastWindowSettings.position, this.windowLogger);
      this.windowLogger.debug(`Adjusted window positions: ${JSON.stringify(lastWindowSettings.position, null, 2)}.`);
    }
    // Initialise window
    if (lastWindowSettings.position === WINDOW_STATES.FullScreen || lastWindowSettings.position === WINDOW_STATES.Maximized) {
      this.window = new BrowserWindow(this.WINDOW_CONSTRUCTOR_OPTIONS);
      if (lastWindowSettings.position === WINDOW_STATES.FullScreen) {
        this.window.setFullScreen(true);
      } else {
        this.window.maximize();
      }
    } else {
      this.window = new BrowserWindow({ ...this.WINDOW_CONSTRUCTOR_OPTIONS, ...lastWindowSettings.position });
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
    this.settingsManager.saveSettings();
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
    // Watch window after show, because it triggers a "move" event
    this.windowPositionWatcher.watchWindowPosition(this.window, this.updateWindowPositionSettings.bind(this));

    // TEMPORARY
    // setInterval(() => {
    //   this.appLogger.warn("SIGNING OUT");
    //   this.userAccountManager.signOutUser();
    // }, 10_000);
    // setTimeout(() => {
    //   setInterval(() => {
    //     this.appLogger.warn("SIGNING IN");
    //     this.userAccountManager.signInUser({ username: "testing", password: "testing" });
    //   }, 10_000);
    // }, 5_000);
  }

  private updateWindowPositionSettings(newWindowPosition: WindowPosition): void {
    if (newWindowPosition === WINDOW_STATES.Minimized) {
      this.settingsManagerLogger.debug("Window minimized. No update to settings.");
    } else {
      // Update settings
      let currentSettings: IAppSettings | null = this.settingsManager.getSettings();
      if (currentSettings === null) {
        currentSettings = this.DEFAULT_SETTINGS;
      }
      this.settingsManager.updateSettings({ ...currentSettings, window: { ...currentSettings.window, position: newWindowPosition } });
    }
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
    this.userManager.openUserAccountStorage(this.USER_ACCOUNT_STORAGE_CONFIG);
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
    if (this.userManager.isUserAccountStorageAvailable()) {
      this.appLogger.info(`Closing "${this.userManager.getUserAccountStorageType()}" User Account Storage.`);
      const IS_USER_STORAGE_CLOSED: boolean = this.userManager.closeUserAccountStorage();
      this.appLogger.debug(IS_USER_STORAGE_CLOSED ? "Closed User Account Storage." : "Could not close User Account Storage.");
    } else {
      this.appLogger.debug("No initialised User Account Storage.");
    }
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private registerIPCMainHandlers(): void {
    this.IPCLogger.debug("Registering IPC API handlers.");
    this.registerIPCTLSAPIIPCHandlers();
    this.registerUserAPIIPCHandlers();
  }

  private registerIPCTLSAPIIPCHandlers(): void {
    this.IPCLogger.debug("Registering IPC TLS API IPC handlers.");
    ipcMain.on(IPC_TLS_API_IPC_CHANNELS.getMainProcessPublicRSAKeyDER, (event: IpcMainEvent): void => {
      event.returnValue = this.IPC_TLS_API_HANDLERS.handleGetMainProcessPublicRSAKeyDER();
    });
    ipcMain.handle(
      IPC_TLS_API_IPC_CHANNELS.sendRendererProcessWrappedAESKey,
      (_: IpcMainInvokeEvent, rendererProcessWrappedAESKey: ArrayBuffer): IPCAPIResponse | Promise<IPCAPIResponse> => {
        return this.IPC_TLS_API_HANDLERS.handleSendRendererProcessWrappedAESKey(rendererProcessWrappedAESKey);
      }
    );
  }

  private registerUserAPIIPCHandlers(): void {
    this.IPCLogger.debug("Registering User API IPC handlers.");
    ipcMain.on(USER_API_IPC_CHANNELS.isAccountStorageAvailable, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleIsAccountStorageAvailable();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.isUsernameAvailable, (event: IpcMainEvent, username: string): void => {
      event.returnValue = this.USER_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signUp, (event: IpcMainEvent, encryptedUserSignUpData: EncryptedUserSignUpData): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignUp(encryptedUserSignUpData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getUserCount, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signIn, (event: IpcMainEvent, encryptedUserSignInData: EncryptedUserSignInData): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignIn(encryptedUserSignInData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signOut, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getCurrentlySignedInUser, (event: IpcMainEvent): void => {
      event.returnValue = this.USER_API_HANDLERS.handleGetCurrentlySignedInUser();
    });
    ipcMain.on(
      USER_API_IPC_CHANNELS.addNewUserDataStorageConfigWithMetadataToUser,
      (event: IpcMainEvent, encryptedNewUserDataStorageConfigWithMetadataInputData: EncryptedUserDataStorageConfigWithMetadataInputData): void => {
        event.returnValue = this.USER_API_HANDLERS.handleAddNewUserDataStorageConfigWithMetadataToUser(
          encryptedNewUserDataStorageConfigWithMetadataInputData
        );
      }
    );
  }
}
