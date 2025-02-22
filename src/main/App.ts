import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { IIPCTLSBootstrapAPI, IIPCTLSBootstrapProgress, IPC_TLS_BOOTSTRAP_API_CHANNELS } from "@shared/IPC/APIs/IPCTLSBootstrapAPI";
import { USER_API_IPC_CHANNELS } from "@shared/IPC/APIs/UserAPI";
import { UserManager } from "@main/user/UserManager";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@main/user/account/storage/backend/UserAccountStorageBackendType";
import { adjustWindowBounds } from "@main/utils/window/adjustWindowBounds";
import { IpcMainEvent } from "electron";
import { IUserAPI } from "@shared/IPC/APIs/UserAPI";
import { MainProcessIPCAPIHandlers } from "@main/utils/IPC/MainProcessIPCAPIHandlers";
import { IUserSignUpDTO, USER_SIGN_UP_DTO_JSON_SCHEMA } from "@shared/user/account/UserSignUpDTO";
import { generateKeyPairSync, webcrypto } from "node:crypto";
import { testAESKey } from "@main/utils/encryption/testAESKey";
import { insertLineBreaks } from "@shared/utils/insertNewLines";
import { bufferToArrayBuffer } from "@main/utils/typeConversions/bufferToArrayBuffer";
import { decryptAndValidateJSON } from "@main/utils/encryption/decryptAndValidateJSON";
import { EncryptedUserSignUpDTO } from "@shared/user/account/encrypted/EncryptedUserSignUpDTO";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { IUserSignInDTO, USER_SIGN_IN_DTO_JSON_SCHEMA } from "@shared/user/account/UserSignInDTO";
import { EncryptedUserSignInDTO } from "@shared/user/account/encrypted/EncryptedUserSignInDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { SettingsManager } from "@main/settings/SettingsManager";
import { SettingsManagerConfig, settingsManagerFactory } from "@main/settings/settingsManagerFactory";
import { SETTINGS_MANAGER_TYPE } from "@main/settings/SettingsManagerType";
import { WINDOW_STATES, WindowPosition, WindowPositionWatcher, WindowStates } from "@main/settings/WindowPositionWatcher";
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { UserAccountStorageBackendConfig } from "@main/user/account/storage/backend/config/UserAccountStorageBackendConfig";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import {
  IUserDataStorageConfigCreateDTO,
  USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { userDataStorageConfigCreateDTOToUserDataStorageConfig } from "./user/data/storage/config/utils/userDataStorageConfigCreateDTOToUserDataStorageConfig";
import { IIPCTLSAPIMain, IPC_TLS_API_CHANNELS } from "@shared/IPC/APIs/IPCTLSAPI";
import { userSignInDTOToUserSignInPayload } from "./user/account/utils/userSignInDTOToUserSignInPayload";
import { userSignUpDTOToUserSignUpPayload } from "./user/account/utils/userSignUpDTOToUserSignUpPayload";

type WindowPositionSetting = Rectangle | WindowStates["FullScreen"] | WindowStates["Maximized"];

interface IWindowSettings {
  position: WindowPositionSetting;
}

export interface IAppSettings {
  window: IWindowSettings;
}

type MainProcessIPCTLSBootstrapAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSBootstrapAPI>;
type MainProcessIPCTLSAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSAPIMain>;
type MainProcessUserAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserAPI>;

export class App {
  // Own singleton instance
  private static instance: null | App = null;

  // Resources
  private readonly ICON_FILE_PATH: string = resolve(join(app.getAppPath(), "resources", "icon.png"));
  private readonly INDEX_HTML_FILE_PATH: string = resolve(join(__dirname, "..", "renderer", "index.html"));

  // Logging
  // TODO: Make these configurable from app settings and JSON
  private readonly LOGS_DIR_PATH: string = resolve(join(app.getAppPath(), "logs"));
  private readonly LOG_FILE_NAME = "BlackBoxLogs.log";
  private readonly LOG_FILE_PATH: string = resolve(join(this.LOGS_DIR_PATH, this.LOG_FILE_NAME));

  private readonly bootstrapLogger: LogFunctions = log.scope("main-bootstrap");
  private readonly appLogger: LogFunctions = log.scope("main-app");
  private readonly windowLogger: LogFunctions = log.scope("main-window");
  private readonly windowPositionWatcherLogger: LogFunctions = log.scope("main-window-position-watcher");
  private readonly settingsManagerLogger: LogFunctions = log.scope("main-settings-manager");
  private readonly IPCTLSBootstrapAPILogger: LogFunctions = log.scope("main-ipc-tls-bootstrap-api");
  private readonly IPCTLSAPILogger: LogFunctions = log.scope("main-ipc-tls-api");
  private readonly UserAPILogger: LogFunctions = log.scope("main-user-api");
  private readonly userManagerLogger: LogFunctions = log.scope("main-user-manager");
  private readonly userAccountStorageBackendLogger: LogFunctions = log.scope("main-user-account-storage-backend");

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
  } as const;
  private readonly DEFAULT_SETTINGS: IAppSettings = {
    window: {
      position: {
        x: 510,
        y: 185,
        width: 900,
        height: 670
      }
    }
  } as const;
  private readonly settingsManager: SettingsManager<IAppSettings, SettingsManagerConfig>;
  private readonly SETTINGS_MANAGER_CONFIG: SettingsManagerConfig = {
    type: SETTINGS_MANAGER_TYPE.LocalJSON,
    fileDir: resolve(join(app.getAppPath(), "settings")),
    fileName: "BlackBoxSettings.json"
  } as const;

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
  } as const;
  private window: null | BrowserWindow = null;
  private readonly windowPositionWatcher: WindowPositionWatcher;

  // Users
  private readonly userManager: UserManager;
  private readonly USER_ACCOUNT_STORAGE_BACKEND_CONFIG: UserAccountStorageBackendConfig = {
    type: USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite,
    dbDirPath: resolve(join(app.getAppPath(), "data")),
    dbFileName: "users.sqlite"
  } as const;

  // Security
  // Will get initialised in the class constructor
  private readonly MAIN_PROCESS_PUBLIC_RSA_KEY_DER: Buffer;
  private readonly MAIN_PROCESS_PRIVATE_RSA_KEY_DER: Buffer;
  // Renderer process will send this over when it is ready
  private isMainTLSReady = false;
  private readonly IPC_TLS_AES_KEY: { value: Buffer | null } = new Proxy<{ value: Buffer | null }>(
    { value: null },
    {
      set: (target: { value: Buffer | null }, property: string | symbol, value: unknown): boolean => {
        if (property !== "value") {
          throw new Error(`Cannot set property "${String(property)}" on IPC TLS AES key. Only "value" property can be set! No-op set.`);
        }
        if (value !== null && !Buffer.isBuffer(value)) {
          throw new Error(`Value must be "null" or a valid Buffer object! No-op set.`);
        }
        target[property] = value;
        this.isMainTLSReady = value !== null;
        this.IPCTLSAPILogger.debug(`Updated main IPC TLS readiness: "${this.isMainTLSReady.toString()}".`);
        this.IPC_TLS_API_HANDLERS.sendMainReadinessChanged(this.isMainTLSReady);
        return true;
      }
    }
  );

  // JSON Schema validator
  private readonly AJV: Ajv;
  // JSON Schema validate functions
  public readonly USER_SIGN_UP_DTO_VALIDATE_FUNCTION: ValidateFunction<IUserSignUpDTO>;
  public readonly USER_SIGN_IN_DTO_VALIDATE_FUNCTION: ValidateFunction<IUserSignInDTO>;
  public readonly USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION: ValidateFunction<IUserDataStorageConfigCreateDTO>;

  // IPC API handlers
  private readonly IPC_TLS_BOOTSTRAP_API_HANDLERS: MainProcessIPCTLSBootstrapAPIIPCHandlers = {
    handleGetPublicRSAKeyDER: (): ArrayBuffer => {
      return bufferToArrayBuffer(this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER);
    },
    handleSendProgress: (progress: IIPCTLSBootstrapProgress): void => {
      if (progress.wasSuccessful) {
        this.IPCTLSBootstrapAPILogger.info(`Received IPC TLS initialisation progress: ${progress.message}.`);
      } else {
        this.IPCTLSBootstrapAPILogger.error(`Received IPC TLS initialisation error: ${progress.message}!`);
      }
    },
    handleSendWrappedAESKey: (wrappedAESKey: ArrayBuffer): void => {
      this.IPCTLSBootstrapAPILogger.info(`Received IPC TLS wrapped AES key:\n${insertLineBreaks(Buffer.from(wrappedAESKey).toString("base64"))}`);
      // Import the main process private RSA key in the WebCryptoAPI format
      webcrypto.subtle
        .importKey("pkcs8", this.MAIN_PROCESS_PRIVATE_RSA_KEY_DER, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["unwrapKey"])
        .then(
          (mainProcessPrivateRSAKey: CryptoKey): void => {
            // And use it to unwrap the IPC TLS AES key
            webcrypto.subtle
              .unwrapKey("raw", wrappedAESKey, mainProcessPrivateRSAKey, { name: "RSA-OAEP" }, { name: "AES-GCM", length: 256 }, true, [
                "encrypt",
                "decrypt"
              ])
              .then(
                (IPCTLSAESKey: CryptoKey): void => {
                  // Extract the IPC TLS AES key to a Buffer for easier synchronous manipulation in the main process
                  webcrypto.subtle
                    .exportKey("raw", IPCTLSAESKey)
                    .then(
                      (IPCTLSAESKeyArrayBuffer: ArrayBuffer): void => {
                        const IPC_TLS_AES_KEY_BUFFER: Buffer = Buffer.from(IPCTLSAESKeyArrayBuffer);
                        if (!testAESKey(IPC_TLS_AES_KEY_BUFFER, this.IPCTLSBootstrapAPILogger)) {
                          this.IPCTLSBootstrapAPILogger.error("IPC TLS AES key failed test!");
                          this.IPC_TLS_AES_KEY.value = null;
                        } else {
                          this.IPCTLSBootstrapAPILogger.info("IPC TLS AES key passed test!");
                          this.IPC_TLS_AES_KEY.value = Buffer.from(IPC_TLS_AES_KEY_BUFFER);
                        }
                      },
                      (reason: unknown): void => {
                        const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                        this.IPCTLSBootstrapAPILogger.error(`Could not export IPC TLS AES key to ArrayBuffer: ${REASON_MESSAGE}!`);
                      }
                    )
                    .catch((reason: unknown): void => {
                      const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                      this.IPCTLSBootstrapAPILogger.error(`Could not export IPC TLS AES key to ArrayBuffer: ${REASON_MESSAGE}!`);
                    });
                },
                (reason: unknown): void => {
                  const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                  this.IPCTLSBootstrapAPILogger.error(`Could not unwrap IPC TLS AES key with main process private RSA key: ${REASON_MESSAGE}!`);
                }
              )
              .catch((reason: unknown): void => {
                const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                this.IPCTLSBootstrapAPILogger.error(`Could not unwrap IPC TLS AES key with main process private RSA key: ${REASON_MESSAGE}!`);
              });
          },
          (reason: unknown): void => {
            const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
            this.IPCTLSBootstrapAPILogger.error(`Could not import main process private RSA key in WebCryptoAPI format: ${REASON_MESSAGE}!`);
          }
        )
        .catch((reason: unknown): void => {
          const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
          this.IPCTLSBootstrapAPILogger.error(`Could not import main process private RSA key in WebCryptoAPI format: ${REASON_MESSAGE}!`);
        });
    }
  };

  private readonly IPC_TLS_API_HANDLERS: MainProcessIPCTLSAPIIPCHandlers = {
    handleIsMainReady: (): boolean => {
      return this.isMainTLSReady;
    },
    sendMainReadinessChanged: (isMainTLSReady: boolean): void => {
      this.IPCTLSAPILogger.debug(`Sending window main IPC TLS readiness: "${isMainTLSReady.toString()}".`);
      if (this.window === null) {
        this.IPCTLSAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.IPCTLSAPILogger.debug(`Messaging renderer on channel: "${IPC_TLS_API_CHANNELS.onMainReadinessChanged}".`);
      this.window.webContents.send(IPC_TLS_API_CHANNELS.onMainReadinessChanged, isMainTLSReady);
    }
  };

  private readonly USER_API_HANDLERS: MainProcessUserAPIIPCHandlers = {
    handleSignUp: (encryptedUserSignUpDTO: EncryptedUserSignUpDTO): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.signUpUser(
            userSignUpDTOToUserSignUpPayload(
              decryptAndValidateJSON<IUserSignUpDTO>(
                encryptedUserSignUpDTO,
                this.USER_SIGN_UP_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "user sign up data"
              ),
              this.userManager.generateRandomUserId(),
              this.UserAPILogger
            )
          )
        };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not sign up user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignIn: (encryptedUserSignInDTO: EncryptedUserSignInDTO): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.signInUser(
            userSignInDTOToUserSignInPayload(
              decryptAndValidateJSON<IUserSignInDTO>(
                encryptedUserSignInDTO,
                this.USER_SIGN_IN_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "user sign in data"
              ),
              this.UserAPILogger
            )
          )
        };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not sign in user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse => {
      try {
        this.userManager.signOutUser();
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not sign out user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsAccountStorageBackendAvailable: (): IPCAPIResponse<boolean> => {
      try {
        const IS_USER_ACCOUNT_STORAGE_BACKEND_AVAILABLE: boolean = this.userManager.isUserAccountStorageBackendAvailable();
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: IS_USER_ACCOUNT_STORAGE_BACKEND_AVAILABLE };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not get User Account Storage Backend availability: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.isUsernameAvailable(username) };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not get username availability: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getUserCount() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not get user count: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getCurrentlySignedInUser() };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not get currently signed in user: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataStorageConfigToUser: (
      encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.addUserDataStorageConfigToUser(
            userDataStorageConfigCreateDTOToUserDataStorageConfig(
              decryptAndValidateJSON<IUserDataStorageConfigCreateDTO>(
                encryptedUserDataStorageConfigCreateDTO,
                this.USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "User Data Storage Config DTO"
              ),
              this.userManager.generateRandomUserDataStorageConfigId(),
              this.UserAPILogger
            )
          )
        };
      } catch (err: unknown) {
        const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
        this.UserAPILogger.error(`Could not add User Data Storage Config: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAccountStorageBackendAvailabilityChanged: (isUserAccountStorageAvailable: boolean): void => {
      this.UserAPILogger.debug(
        `Sending window User Account Storage Backend availability after change: "${isUserAccountStorageAvailable.toString()}".`
      );
      if (this.window === null) {
        this.UserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.UserAPILogger.debug(`Messaging renderer on channel: "${USER_API_IPC_CHANNELS.onAccountStorageBackendAvailabilityChanged}".`);
      this.window.webContents.send(USER_API_IPC_CHANNELS.onAccountStorageBackendAvailabilityChanged, isUserAccountStorageAvailable);
    },
    sendCurrentlySignedInUserChanged: (newCurrentlySignedInUser: ICurrentlySignedInUser | null): void => {
      this.UserAPILogger.debug(`Sending window currently signed in user after change: ${JSON.stringify(newCurrentlySignedInUser, null, 2)}.`);
      if (this.window === null) {
        this.UserAPILogger.debug('Window is "null". No-op.');
        return;
      }
      this.UserAPILogger.debug(`Messaging renderer on channel: "${USER_API_IPC_CHANNELS.onCurrentlySignedInUserChanged}".`);
      this.window.webContents.send(USER_API_IPC_CHANNELS.onCurrentlySignedInUserChanged, newCurrentlySignedInUser);
    }
  };

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialise electron-log
    log.initialize();
    log.transports.file.resolvePathFn = (): string => {
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
    // Initialise AJV
    this.AJV = new Ajv({ strict: true });
    addFormats(this.AJV);
    // Initialise JSON Schema validate functions\
    this.USER_SIGN_UP_DTO_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInDTO>(USER_SIGN_UP_DTO_JSON_SCHEMA);
    this.USER_SIGN_IN_DTO_VALIDATE_FUNCTION = this.AJV.compile<IUserSignInDTO>(USER_SIGN_IN_DTO_JSON_SCHEMA);
    this.USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION = this.AJV.compile<IUserDataStorageConfigCreateDTO>(
      USER_DATA_STORAGE_CONFIG_CREATE_DTO_JSON_SCHEMA
    );
    // Initialise required managers & watchers
    this.userManager = new UserManager(this.userManagerLogger, this.userAccountStorageBackendLogger, this.AJV);
    this.userManager.onCurrentlySignedInUserChangedCallback = this.USER_API_HANDLERS.sendCurrentlySignedInUserChanged;
    this.userManager.onUserAccountStorageBackendAvailabilityChangedCallback = this.USER_API_HANDLERS.sendAccountStorageBackendAvailabilityChanged;
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
      `Generated main process public RSA key:\n${insertLineBreaks(this.MAIN_PROCESS_PUBLIC_RSA_KEY_DER.toString("base64"))}\n.`
    );
    this.bootstrapLogger.debug("App constructor done.");
  }

  public run(): void {
    this.bootstrapLogger.info("Running App.");
    this.bootstrapLogger.debug("Registering app event handlers.");
    app.once("ready", (): void => {
      this.onceAppReady();
    });
    app.on("window-all-closed", (): void => {
      this.onAppWindowAllClosed();
    });
    app.once("will-quit", (): void => {
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
    this.window.once("closed", (): void => {
      this.onceWindowClosed();
    });
    this.window.once("ready-to-show", (): void => {
      this.onceWindowReadyToShow();
    });
    this.window.webContents.once("did-finish-load", (): void => {
      this.onceWindowWebContentsDidFinishLoad();
    });
    this.window.webContents.once("did-fail-load", (): void => {
      this.onceWindowWebContentsDidFailLoad();
    });
    this.window.webContents.setWindowOpenHandler((details: HandlerDetails): WindowOpenHandlerResponse => {
      return this.windowOpenHandler(details);
    });
    this.windowLogger.debug("Registered window event handlers.");
    this.windowLogger.info("Selecting window web contents source.");
    let isDevToolsShortcutRegistered = false;
    if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
      this.windowLogger.info(`Loading window web contents from URL: "${process.env.ELECTRON_RENDERER_URL}".`);
      void this.window.loadURL(process.env.ELECTRON_RENDERER_URL);
      isDevToolsShortcutRegistered = globalShortcut.register("CmdOrCtrl+F12", (): void => {
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
      this.window.webContents.on("devtools-opened", (): void => {
        this.onWindowWebContentsDeveloperToolsOpened();
      });
      this.window.webContents.on("devtools-closed", (): void => {
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
    // Watch window only after show, because it triggers a "move" event
    this.windowPositionWatcher.watchWindowPosition(this.window, this.updateWindowPositionSettings.bind(this));

    // TEMPORARY
    // TODO: Remove this
    // setInterval(() => {
    //   this.appLogger.warn("SIGNING OUT");
    //   this.userManager.signOutUser();
    // }, 10_000);
    // setTimeout(() => {
    //   setInterval(() => {
    //     this.appLogger.warn("SIGNING IN");
    //     this.userManager.signInUser({ username: "testing", password: "testing" });
    //   }, 10_000);
    // }, 5_000);
    // let latestVal: Buffer | null = null;
    // setInterval(() => {
    //   if (latestVal === null) {
    //     latestVal = this.IPC_TLS_AES_KEY.value;
    //     this.IPC_TLS_AES_KEY.value = null;
    //   } else {
    //     this.IPC_TLS_AES_KEY.value = latestVal;
    //     latestVal = null;
    //   }
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
    // TODO: Make this an actual UserAccountStorage, not just a backend. Add specificity in error messages, add new class and configs required
    this.userManager.openUserAccountStorageBackend(this.USER_ACCOUNT_STORAGE_BACKEND_CONFIG);
    this.createWindow();
    this.appLogger.debug("Registering app activate event handler.");
    app.on("activate", (): void => {
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
    if (this.userManager.isUserAccountStorageBackendAvailable()) {
      this.appLogger.info(`Closing "${this.userManager.getUserAccountStorageBackendType()}" User Account Storage Backend.`);
      const IS_USER_STORAGE_CLOSED: boolean = this.userManager.closeUserAccountStorageBackend();
      this.appLogger.debug(IS_USER_STORAGE_CLOSED ? "Closed" : "Could not close" + " User Account Storage Backend.");
    } else {
      this.appLogger.debug("No initialised User Account Storage Backend.");
    }
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private registerIPCMainHandlers(): void {
    this.windowLogger.debug("Registering IPC API handlers.");
    this.registerIPCTLSBootstrapIPCHandlers();
    this.registerIPCTLSAPIIPCHandlers();
    this.registerUserAPIIPCHandlers();
  }

  private registerIPCTLSBootstrapIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC TLS Bootstrap IPC handlers.");
    ipcMain.on(IPC_TLS_BOOTSTRAP_API_CHANNELS.getPublicRSAKeyDER, (event: IpcMainEvent): void => {
      this.IPCTLSBootstrapAPILogger.debug(`Received message from renderer on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.getPublicRSAKeyDER}".`);
      event.returnValue = this.IPC_TLS_BOOTSTRAP_API_HANDLERS.handleGetPublicRSAKeyDER();
    });
    ipcMain.on(IPC_TLS_BOOTSTRAP_API_CHANNELS.sendProgress, (_: IpcMainEvent, progress: IIPCTLSBootstrapProgress): void => {
      this.IPCTLSBootstrapAPILogger.debug(`Received message from renderer on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.sendProgress}".`);
      this.IPC_TLS_BOOTSTRAP_API_HANDLERS.handleSendProgress(progress);
    });
    ipcMain.on(IPC_TLS_BOOTSTRAP_API_CHANNELS.sendWrappedAESKey, (_: IpcMainEvent, wrappedIPCTLSAESKey: ArrayBuffer): void => {
      this.IPCTLSBootstrapAPILogger.debug(`Received message from renderer on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.sendWrappedAESKey}".`);
      this.IPC_TLS_BOOTSTRAP_API_HANDLERS.handleSendWrappedAESKey(wrappedIPCTLSAESKey);
    });
  }

  private registerIPCTLSAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC TLS IPC handlers.");
    ipcMain.on(IPC_TLS_API_CHANNELS.isMainReady, (event: IpcMainEvent): void => {
      this.IPCTLSBootstrapAPILogger.debug(`Received message from renderer on channel: "${IPC_TLS_API_CHANNELS.isMainReady}".`);
      event.returnValue = this.IPC_TLS_API_HANDLERS.handleIsMainReady();
    });
  }

  private registerUserAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User API IPC handlers.");
    ipcMain.on(USER_API_IPC_CHANNELS.isAccountStorageBackendAvailable, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.isAccountStorageBackendAvailable}".`);
      event.returnValue = this.USER_API_HANDLERS.handleIsAccountStorageBackendAvailable();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.isUsernameAvailable, (event: IpcMainEvent, username: string): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.isUsernameAvailable}".`);
      event.returnValue = this.USER_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signUp, (event: IpcMainEvent, encryptedUserSignUpData: EncryptedUserSignUpDTO): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signUp}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignUp(encryptedUserSignUpData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getUserCount, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getUserCount}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signIn, (event: IpcMainEvent, encryptedUserSignInData: EncryptedUserSignInDTO): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signIn}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignIn(encryptedUserSignInData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signOut, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signOut}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getCurrentlySignedInUser, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getCurrentlySignedInUser}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetCurrentlySignedInUser();
    });
    ipcMain.on(
      USER_API_IPC_CHANNELS.addUserDataStorageConfigToUser,
      (event: IpcMainEvent, encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO): void => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.addUserDataStorageConfigToUser}".`);
        event.returnValue = this.USER_API_HANDLERS.handleAddUserDataStorageConfigToUser(encryptedUserDataStorageConfigCreateDTO);
      }
    );
  }
}
