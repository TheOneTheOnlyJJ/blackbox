import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen, dialog } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { IIPCTLSBootstrapAPI, IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS } from "@shared/IPC/APIs/IPCTLSBootstrapAPI";
import { USER_AUTH_API_IPC_CHANNELS, UserAuthAPIIPCChannel } from "@shared/IPC/APIs/UserAuthAPI";
import { IUserFacadeConstructorProps, IUserServiceLoggers, UserFacade } from "@main/user/facade/UserFacade";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { adjustWindowBounds } from "@main/utils/window/adjustWindowBounds";
import { IpcMainEvent, IpcMainInvokeEvent, OpenDialogReturnValue } from "electron";
import { IUserAuthAPI } from "@shared/IPC/APIs/UserAuthAPI";
import { MainProcessIPCAPIHandlers } from "@main/utils/IPC/MainProcessIPCAPIHandlers";
import { IUserSignUpDTO, isValidUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { generateKeyPairSync, UUID, webcrypto } from "node:crypto";
import { isAESKeyValid } from "@main/utils/encryption/isAESKeyValid";
import { bufferToArrayBuffer } from "@main/utils/typeConversions/bufferToArrayBuffer";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";
import { IUserSignInDTO, isValidUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { settingsStorageFactory } from "@main/settings/settingsStorageFactory";
import { SETTINGS_STORAGE_TYPES } from "@main/settings/SettingsStorageType";
import { WINDOW_STATES, WindowPosition, WindowPositionWatcher, WindowStates } from "@main/settings/WindowPositionWatcher";
import {
  IUserDataStorageConfigCreateDTO,
  isValidUserDataStorageConfigCreateDTO
} from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IIPCTLSAPIMain, IPC_TLS_API_IPC_CHANNELS, IPCTLSAPIIPCChannel } from "@shared/IPC/APIs/IPCTLSAPI";
import { IUserAccountStorageConfig } from "./user/account/storage/config/UserAccountStorageConfig";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { SettingsStorage } from "./settings/SettingsStorage";
import { BaseSettings } from "./settings/BaseSettings";
import { SettingsStorageConfig } from "./settings/SettingsStorageConfig";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { encryptWithAES } from "./utils/encryption/encryptWithAES";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IGetDirectoryPathWithPickerOptions, IUtilsAPI, UTILS_API_IPC_CHANNELS } from "@shared/IPC/APIs/UtilsAPI";
import {
  IUserDataStorageVisibilityGroupConfigCreateDTO,
  isValidUserDataStorageVisibilityGroupConfigCreateDTO
} from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import {
  IUserDataStorageVisibilityGroupsOpenRequestDTO,
  isValidUserDataStorageVisibilityGroupsOpenRequestDTO
} from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IUserContextHandlers, IUserContextLoggers } from "./user/facade/context/UserContext";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import {
  IUserDataStorageConfigAPI,
  USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS,
  UserDataStorageConfigAPIIPCChannel
} from "@shared/IPC/APIs/UserDataStorageConfigAPI";
import {
  IUserAccountStorageAPI,
  USER_ACCOUNT_STORAGE_API_IPC_CHANNELS,
  UserAccountStorageAPIIPCChannel
} from "@shared/IPC/APIs/UserAccountStorageAPI";
import {
  IUserDataStorageVisibilityGroupAPI,
  USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS,
  UserDataStorageVisibilityGroupAPIIPCChannel
} from "@shared/IPC/APIs/UserDataStorageVisibilityGroupAPI";

type WindowPositionSetting = Rectangle | WindowStates["FullScreen"] | WindowStates["Maximized"];

interface IWindowSettings extends BaseSettings {
  position: WindowPositionSetting;
}

export interface IAppSettings extends BaseSettings {
  window: IWindowSettings;
}

type MainProcessIPCTLSBootstrapAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSBootstrapAPI>;
type MainProcessIPCTLSAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSAPIMain>;
type MainProcessUserAuthAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserAuthAPI>;
type MainProcessUserAccountStorageAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserAccountStorageAPI>;
type MainProcessUserDataStorageConfigAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataStorageConfigAPI>;
type MainProcessUserDataStorageVisibilityGroupAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataStorageVisibilityGroupAPI>;
type MainProcessUtilsAPIIPCHandlers = MainProcessIPCAPIHandlers<IUtilsAPI>;

export class App {
  // Own singleton instance
  private static instance: null | App = null;

  // Resources
  private readonly ICON_FILE_PATH: string = resolve(join(app.getAppPath(), "resources", "icon.png"));
  private readonly INDEX_HTML_FILE_PATH: string = resolve(join(__dirname, "..", "renderer", "index.html"));

  // Logging
  // TODO: Make these configurable from app settings and JSON and have these as defaults
  private readonly LOGS_DIR_PATH: string = resolve(join(app.getAppPath(), "logs"));
  private readonly LOG_FILE_NAME = "BlackBoxLogs.log";
  private readonly LOG_FILE_PATH: string = resolve(join(this.LOGS_DIR_PATH, this.LOG_FILE_NAME));

  private readonly bootstrapLogger: LogFunctions = log.scope("m-boot");
  private readonly appLogger: LogFunctions = log.scope("m-app");
  private readonly windowLogger: LogFunctions = log.scope("m-win");
  private readonly windowPositionWatcherLogger: LogFunctions = log.scope("m-win-pos-watch");

  private readonly IPCTLSBootstrapAPILogger: LogFunctions = log.scope("m-ipc-tls-boot-api");
  private readonly IPCTLSAPILogger: LogFunctions = log.scope("m-ipc-tls-api");
  private readonly UserAuthAPILogger: LogFunctions = log.scope("m-uauth-api");
  private readonly UserAccountStorageAPILogger: LogFunctions = log.scope("m-uacc-strg-api");
  private readonly UserDataStorageConfigAPILogger: LogFunctions = log.scope("m-udata-strg-cfg-api");
  private readonly UserDataStorageVisibilityGroupAPILogger: LogFunctions = log.scope("m-udata-strg-vgrp-api");
  private readonly UtilsAPILogger: LogFunctions = log.scope("m-utls-api");

  private readonly userFacadeLogger: LogFunctions = log.scope("m-usr-fac");
  private readonly USER_CONTEXT_LOGGERS: IUserContextLoggers = {
    main: log.scope("m-uctx"),
    subcontexts: {
      userAccountStorage: log.scope("m-uacc-strg-ctx"),
      userAuth: log.scope("m-uauth-ctx"),
      availableUserDataStorageConfigs: log.scope("m-avail-data-strg-cfg-ctx"),
      openUserDataStorageVisibilityGroups: log.scope("m-opn-udata-strg-vgrp-ctx")
    }
  } as const;
  private readonly userContextProviderLogger: LogFunctions = log.scope("m-uctx-prvdr");
  private readonly USER_SERVICE_LOGGERS: IUserServiceLoggers = {
    auth: log.scope("m-uauth-svc"),
    account: log.scope("m-uacc-svc"),
    accountStorage: log.scope("m-uacc-strg-svc"),
    dataStorageConfig: log.scope("m-udata-strg-cfg-svc"),
    dataStorageVisibilityGroup: log.scope("m-udata-strg-vgrp-svc")
  } as const;

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
  private readonly settingsStorage: SettingsStorage<IAppSettings>;
  private readonly SETTINGS_STORAGE_CONFIG: SettingsStorageConfig = {
    type: SETTINGS_STORAGE_TYPES.localJSON,
    doSaveOnUpdate: false,
    fileDir: resolve(join(app.getAppPath(), "settings")),
    fileName: "BlackBoxSettings.json"
  } as const;
  private readonly DEFAULT_SETTINGS_STORAGE_LOG_SCOPE = "m-dflt-sets-strg";

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
  private readonly userFacade: UserFacade;
  private readonly DEFAULT_USER_ACCOUNT_STORAGE_CONFIG: IUserAccountStorageConfig = {
    storageId: "00000000-0000-0000-0000-000000000000",
    name: "Default",
    backendConfig: {
      type: USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite,
      dbDirPath: resolve(join(app.getAppPath(), "data")),
      dbFileName: "users.sqlite"
    }
  } as const;
  private readonly DEFAULT_USER_ACCOUNT_STORAGE_LOG_SCOPE = "m-uacc-strg-dflt";

  // Security
  private IPCTLSBootstrapPrivateRSAKey: CryptoKey | null;
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
          throw new Error(`Value must be null or a valid Buffer object! No-op set.`);
        }
        if (value !== null && !isAESKeyValid(value, this.IPCTLSBootstrapAPILogger, "IPC TLS")) {
          throw new Error("Invalid AES key given! No-op set.");
        }
        target[property] = value;
        this.isMainTLSReady = value !== null;
        this.IPCTLSAPILogger.debug(`Updated main IPC TLS readiness: ${this.isMainTLSReady.toString()}.`);
        this.IPC_TLS_API_HANDLERS.sendMainReadinessChanged(this.isMainTLSReady);
        return true;
      }
    }
  );

  // IPC API handlers
  private readonly IPC_TLS_BOOTSTRAP_API_HANDLERS: MainProcessIPCTLSBootstrapAPIIPCHandlers = {
    handleGenerateAndGetMainProcessIPCTLSPublicRSAKeyDER: async (): Promise<IPCAPIResponse<ArrayBuffer>> => {
      try {
        const { publicKey, privateKey } = generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: { type: "spki", format: "der" },
          privateKeyEncoding: { type: "pkcs8", format: "der" }
        });
        this.IPCTLSBootstrapPrivateRSAKey = await webcrypto.subtle.importKey("pkcs8", privateKey, { name: "RSA-OAEP", hash: "SHA-256" }, true, [
          "unwrapKey"
        ]);
        this.IPCTLSBootstrapAPILogger.info("Generated IPC TLS bootstrap RSA key pair.");
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: bufferToArrayBuffer(publicKey) };
      } catch (error: unknown) {
        const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
        this.IPCTLSBootstrapAPILogger.error(`Main process IPC TLS RSA key generation error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: ERROR_MESSAGE };
      }
    },
    handleSendWrappedIPCTLSAESKey: async (wrappedIPCTLSAESKeyIPCAPIResponse: IPCAPIResponse<ArrayBuffer>): Promise<void> => {
      this.IPCTLSBootstrapAPILogger.info("Received wrapped IPC TLS AES key.");
      if (wrappedIPCTLSAESKeyIPCAPIResponse.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
        this.IPCTLSBootstrapPrivateRSAKey = null;
        throw new Error(wrappedIPCTLSAESKeyIPCAPIResponse.error);
      }
      if (this.IPCTLSBootstrapPrivateRSAKey === null) {
        throw new Error("Null IPC TLS bootstrap private RSA key!");
      }
      try {
        const UNWRAPPED_IPC_TLS_AES_KEY: CryptoKey = await webcrypto.subtle.unwrapKey(
          "raw",
          wrappedIPCTLSAESKeyIPCAPIResponse.data,
          this.IPCTLSBootstrapPrivateRSAKey,
          { name: "RSA-OAEP" },
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        const EXPORTED_IPC_TLS_AES_KEY: ArrayBuffer = await webcrypto.subtle.exportKey("raw", UNWRAPPED_IPC_TLS_AES_KEY);
        this.IPC_TLS_AES_KEY.value = Buffer.from(EXPORTED_IPC_TLS_AES_KEY);
      } catch (error: unknown) {
        this.IPCTLSBootstrapPrivateRSAKey = null;
        const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
        this.IPCTLSBootstrapAPILogger.error(`Could not obtain IPC TLS AES key: ${ERROR_MESSAGE}!`);
      }
    }
  } as const;

  private readonly IPC_TLS_API_HANDLERS: MainProcessIPCTLSAPIIPCHandlers = {
    handleGetMainReadiness: (): boolean => {
      return this.isMainTLSReady;
    },
    sendMainReadinessChanged: (newIsMainTLSReady: boolean): void => {
      this.IPCTLSAPILogger.debug(`Sending window main IPC TLS readiness: ${newIsMainTLSReady.toString()}.`);
      if (this.window === null) {
        this.IPCTLSAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: IPCTLSAPIIPCChannel = IPC_TLS_API_IPC_CHANNELS.onMainReadinessChanged;
      this.IPCTLSAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newIsMainTLSReady);
    }
  } as const;

  private readonly USER_AUTH_API_HANDLERS: MainProcessUserAuthAPIIPCHandlers = {
    handleSignUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.signUpUserFromDTO(
            decryptWithAESAndValidateJSON<IUserSignUpDTO>(
              encryptedUserSignUpDTO,
              isValidUserSignUpDTO,
              this.IPC_TLS_AES_KEY.value,
              this.UserAuthAPILogger,
              "user sign up DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAuthAPILogger.error(`Sign up error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.signInUserFromDTO(
            decryptWithAESAndValidateJSON<IUserSignInDTO>(
              encryptedUserSignInDTO,
              isValidUserSignInDTO,
              this.IPC_TLS_AES_KEY.value,
              this.UserAuthAPILogger,
              "user sign in DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAuthAPILogger.error(`Sign in error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse<ISignedInUserInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.signOutUser() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAuthAPILogger.error(`Sign out error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.isUsernameAvailable(username) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAuthAPILogger.error(`Is username available error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetSignedInUserInfo: (): IPCAPIResponse<ISignedInUserInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getSignedInUserInfo() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAuthAPILogger.error(`Get signed in user error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendSignedInUserChanged: (newSignedInUserInfo: ISignedInUserInfo | null): void => {
      this.UserAuthAPILogger.debug(`Sending window signed in user info after change: ${JSON.stringify(newSignedInUserInfo, null, 2)}.`);
      if (this.window === null) {
        this.UserAuthAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAuthAPIIPCChannel = USER_AUTH_API_IPC_CHANNELS.onSignedInUserChanged;
      this.UserAuthAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newSignedInUserInfo);
    }
  } as const;

  private readonly USER_ACCOUNT_STORAGE_API_HANDLERS: MainProcessUserAccountStorageAPIIPCHandlers = {
    handleIsUserAccountStorageOpen: (): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.isAccountStorageOpen() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAccountStorageAPILogger.error(`Is User Account Storage open error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getUserCount() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAccountStorageAPILogger.error(`Get user count error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUsernameForUserId: (userId: string): IPCAPIResponse<string | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getUsernameForUserId(userId as UUID) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAccountStorageAPILogger.error(`Get username for user ID error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserAccountStorageInfo: (): IPCAPIResponse<IUserAccountStorageInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getAccountStorageInfo() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAccountStorageAPILogger.error(`Get User Account Storage Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendUserAccountStorageChanged: (newUserAccountStorageInfo: IUserAccountStorageInfo | null): void => {
      this.UserAccountStorageAPILogger.debug(
        `Sending window public User Account Storage Info after change: ${JSON.stringify(newUserAccountStorageInfo, null, 2)}.`
      );
      if (this.window === null) {
        this.UserAccountStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageChanged;
      this.UserAccountStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newUserAccountStorageInfo);
    },
    sendUserAccountStorageInfoChanged: (newUserAccountStorageInfo: Readonly<IUserAccountStorageInfo>): void => {
      this.UserAccountStorageAPILogger.debug(
        `Sending window User Account Storage open status after change: ${JSON.stringify(newUserAccountStorageInfo, null, 2).toString()}.`
      );
      if (this.window === null) {
        this.UserAccountStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageInfoChanged;
      this.UserAccountStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newUserAccountStorageInfo);
    }
  } as const;

  private readonly USER_DATA_STORAGE_CONFIG_API_HANDLERS: MainProcessUserDataStorageConfigAPIIPCHandlers = {
    handleAddUserDataStorageConfig: (
      encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.addUserDataStorageConfigFromCreateDTO(
            decryptWithAESAndValidateJSON<IUserDataStorageConfigCreateDTO>(
              encryptedUserDataStorageConfigCreateDTO,
              isValidUserDataStorageConfigCreateDTO,
              this.IPC_TLS_AES_KEY.value,
              this.UserDataStorageConfigAPILogger,
              "User Data Storage Config Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageConfigAPILogger.error(`Add User Data Storage Config error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserAvailableDataStorageConfigsInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataStorageConfigInfo[]>(
            this.userFacade.getAllSignedInUserAvailableDataStorageConfigsInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.UserDataStorageConfigAPILogger,
            "all signed in user's available User Data Storage Configs Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageConfigAPILogger.error(`Get all signed in user's available User Data Storages Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAvailableUserDataStorageConfigsChanged: (
      availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>
    ): void => {
      this.UserDataStorageConfigAPILogger.debug(
        `Sending window available User Data Storage Configs Info Changed Diff. Removals: ${availableUserDataStorageConfigsInfoChangedDiff.removed.length.toString()}. Additions: ${availableUserDataStorageConfigsInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.UserDataStorageConfigAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.onAvailableUserDataStorageConfigsChanged;
      this.UserDataStorageConfigAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<string, IUserDataStorageConfigInfo>>(
          availableUserDataStorageConfigsInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.UserDataStorageConfigAPILogger,
          "available User Data Storage Configs Info Changed Diff"
        )
      );
    }
  };

  private readonly USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS: MainProcessUserDataStorageVisibilityGroupAPIIPCHandlers = {
    handleIsUserDataStorageVisibilityGroupNameAvailableForSignedInUser: (name: string): IPCAPIResponse<boolean> => {
      try {
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.isDataStorageVisibilityGroupNameAvailableForSignedInUser(name)
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageVisibilityGroupAPILogger.error(
          `Is User Data Storage Visibility Group name available for signed in user error: ${ERROR_MESSAGE}!`
        );
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataStorageVisibilityGroupConfig: (
      encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.addUserDataStorageVisibilityGroupConfigFromCreateDTO(
            decryptWithAESAndValidateJSON<IUserDataStorageVisibilityGroupConfigCreateDTO>(
              encryptedUserDataStorageVisibilityGroupConfigCreateDTO,
              isValidUserDataStorageVisibilityGroupConfigCreateDTO,
              this.IPC_TLS_AES_KEY.value,
              this.UserDataStorageVisibilityGroupAPILogger,
              "User Data Storage Visibility Group Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageVisibilityGroupAPILogger.error(`Add User Data Storage Visibility Group error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleOpenUserDataStorageVisibilityGroups: (
      encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
    ): IPCAPIResponse<number> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.openUserDataStorageVisibilityGroupsFromOpenRequestDTO(
            decryptWithAESAndValidateJSON<IUserDataStorageVisibilityGroupsOpenRequestDTO>(
              encryptedUserDataStorageVisibilityGroupsOpenRequestDTO,
              isValidUserDataStorageVisibilityGroupsOpenRequestDTO,
              this.IPC_TLS_AES_KEY.value,
              this.UserDataStorageVisibilityGroupAPILogger,
              "User Data Storage Visibility Group DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageVisibilityGroupAPILogger.error(`Open User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleCloseUserDataStorageVisibilityGroups: (userDataStorageVisibilityGroupIds: string[]): IPCAPIResponse<number> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.closeUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupIds as UUID[])
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageVisibilityGroupAPILogger.error(`Close User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataStorageVisibilityGroupInfo[]>(
            this.userFacade.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.UserDataStorageVisibilityGroupAPILogger,
            "all signed in user's open User Data Storage Visibility Groups Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserDataStorageVisibilityGroupAPILogger.error(
          `Get all signed in user's open User Data Storage Visibility Groups Info error: ${ERROR_MESSAGE}!`
        );
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendOpenUserDataStorageVisibilityGroupsChanged: (
      userDataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>
    ): void => {
      this.UserDataStorageVisibilityGroupAPILogger.debug(
        `Sending window open User Data Storages Visibility Groups Info Changed Diff. Removals: ${userDataStorageVisibilityGroupsInfoChangedDiff.removed.length.toString()}. Additions: ${userDataStorageVisibilityGroupsInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.UserDataStorageVisibilityGroupAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
        USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.onOpenUserDataStorageVisibilityGroupsChanged;
      this.UserDataStorageVisibilityGroupAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>(
          userDataStorageVisibilityGroupsInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.UserDataStorageVisibilityGroupAPILogger,
          "open User Data Storage Visibility Groups Info Changed Diff"
        )
      );
    }
  } as const;

  private readonly UTILS_API_HANDLERS: MainProcessUtilsAPIIPCHandlers = {
    handleGetDirectoryPathWithPicker: async (
      options: IGetDirectoryPathWithPickerOptions
    ): Promise<IPCAPIResponse<IEncryptedData<string[]> | null>> => {
      try {
        if (this.window === null) {
          throw new Error("Window is null");
        }
        const OPEN_DIALOG_RETURN_VALUE: OpenDialogReturnValue = await dialog.showOpenDialog(this.window, {
          title: options.pickerTitle,
          properties: options.multiple ? ["openDirectory", "multiSelections"] : ["openDirectory"]
        });
        if (OPEN_DIALOG_RETURN_VALUE.canceled) {
          return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: null };
        }
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<string[]>(OPEN_DIALOG_RETURN_VALUE.filePaths, this.IPC_TLS_AES_KEY.value, this.UtilsAPILogger, "picked directory path")
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UtilsAPILogger.error(`Get directory with picker error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    }
  } as const;

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
    // Initialise required classes & watchers
    this.settingsStorage = settingsStorageFactory<IAppSettings>(
      this.SETTINGS_STORAGE_CONFIG,
      App.SETTINGS_SCHEMA,
      this.DEFAULT_SETTINGS_STORAGE_LOG_SCOPE,
      this.bootstrapLogger
    );
    this.windowPositionWatcher = new WindowPositionWatcher(this.windowPositionWatcherLogger);
    // Read app settings
    try {
      this.settingsStorage.fetchSettings(true);
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.bootstrapLogger.error(`Fetch app settings error: ${ERROR_MESSAGE}!`);
      this.bootstrapLogger.warn("Using default app settings.");
      this.settingsStorage.updateSettings(this.DEFAULT_SETTINGS);
    }
    this.bootstrapLogger.debug(`Using app settings: ${JSON.stringify(this.settingsStorage.getSettings(), null, 2)}.`);
    this.userFacade = new UserFacade({
      logger: this.userFacadeLogger,
      contextLoggers: this.USER_CONTEXT_LOGGERS,
      contextProviderLogger: this.userContextProviderLogger,
      serviceLoggers: this.USER_SERVICE_LOGGERS,
      contextHandlers: {
        onSignedInUserChangedCallback: this.USER_AUTH_API_HANDLERS.sendSignedInUserChanged,
        onUserAccountStorageChangedCallback: this.USER_ACCOUNT_STORAGE_API_HANDLERS.sendUserAccountStorageChanged,
        onAvailableSecuredUserDataStorageConfigsChangedCallback:
          this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.sendAvailableUserDataStorageConfigsChanged,
        onOpenUserDataStorageVisibilityGroupsChangedCallback:
          this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.sendOpenUserDataStorageVisibilityGroupsChanged
      } satisfies IUserContextHandlers
    } satisfies IUserFacadeConstructorProps);
    this.IPCTLSBootstrapPrivateRSAKey = null;
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
      lastWindowSettings = this.settingsStorage.fetchSettings(false).window;
    } catch {
      this.windowLogger.warn("Using default window settings.");
      lastWindowSettings = this.DEFAULT_SETTINGS.window;
    }
    this.windowLogger.debug(`Using window settings: ${JSON.stringify(lastWindowSettings, null, 2)}.`);
    // Adjust bounds if the window positions are a Rectangle
    if (lastWindowSettings.position !== WINDOW_STATES.FullScreen && lastWindowSettings.position !== WINDOW_STATES.Maximized) {
      this.windowLogger.debug("Adjusting window bounds.");
      const PRIMARY_DISPLAY_BOUNDS: Rectangle = screen.getPrimaryDisplay().workArea;
      this.windowLogger.silly(`Primary display work area bounds: ${JSON.stringify(PRIMARY_DISPLAY_BOUNDS, null, 2)}.`);
      lastWindowSettings.position = adjustWindowBounds(PRIMARY_DISPLAY_BOUNDS, lastWindowSettings.position, this.windowLogger);
      this.windowLogger.silly(`Adjusted window positions: ${JSON.stringify(lastWindowSettings.position, null, 2)}.`);
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
    this.settingsStorage.saveSettings();
    this.windowLogger.debug("Removing all listeners from window.");
    this.window.removeAllListeners();
    this.window = null;
    this.windowLogger.debug("Window set to null.");
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
    // TODO: Delete comment
    // setInterval(() => {
    //   this.appLogger.warn("SIGNING OUT");
    //   this.userFacade.signOutUser();
    // }, 10_000);
    // setTimeout(() => {
    //   setInterval(() => {
    //     this.appLogger.warn("SIGNING IN");
    //     this.userFacade.signInUser({ username: "testing", password: "testing" });
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
      this.windowLogger.debug("Window minimized. No update to settings.");
    } else {
      // Update settings
      let currentSettings: IAppSettings | null = this.settingsStorage.getSettings();
      if (currentSettings === null) {
        currentSettings = this.DEFAULT_SETTINGS;
      }
      this.settingsStorage.updateSettings({ ...currentSettings, window: { ...currentSettings.window, position: newWindowPosition } });
    }
  }

  private onceWindowWebContentsDidFinishLoad(): void {
    this.windowLogger.info("Loaded window web contents.");
  }

  private onceWindowWebContentsDidFailLoad(): void {
    this.windowLogger.error("Failed loading window web contents.");
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
          this.windowLogger.error(`Could not open external URL: "${details.url}". Reason: ${REASON_MESSAGE}.`);
        }
      )
      .catch((error: unknown): void => {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.windowLogger.error(`Error opening external URL: "${details.url}": ${ERROR_MESSAGE}.`);
      });
    return { action: "deny" };
  }

  private onceAppReady(): void {
    this.appLogger.info("App ready.");
    this.userFacade.setAccountStorageFromConfig(
      this.DEFAULT_USER_ACCOUNT_STORAGE_CONFIG,
      this.DEFAULT_USER_ACCOUNT_STORAGE_LOG_SCOPE,
      this.USER_ACCOUNT_STORAGE_API_HANDLERS.sendUserAccountStorageInfoChanged
    );
    this.userFacade.openAccountStorage();
    // TODO: Delete comment
    // setInterval(() => {
    //   if (!this.userFacade.isAccountStorageSet()) {
    //     return;
    //   }
    //   if (this.userFacade.isAccountStorageOpen()) {
    //     this.userFacade.closeAccountStorage();
    //   } else {
    //     this.userFacade.openAccountStorage();
    //   }
    // }, 5_000);
    // setInterval((): void => {
    //   if (this.userFacade.isAccountStorageSet()) {
    //     this.userFacade.unsetAccountStorage();
    //   } else {
    //     this.userFacade.setAccountStorageFromConfig(
    //       this.DEFAULT_USER_ACCOUNT_STORAGE_CONFIG,
    //       this.DEFAULT_USER_ACCOUNT_STORAGE_LOG_SCOPE,
    //       this.USER_ACCOUNT_STORAGE_API_HANDLERS.sendUserAccountStorageInfoChanged
    //     );
    //   }
    // }, 7_500);
    this.createWindow();
    this.appLogger.debug("Registering app activate event handler.");
    app.on("activate", (): void => {
      this.onAppActivate();
    });
    this.registerIPCHandlers();
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
    this.userFacade.destroy();
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private registerIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC API handlers.");
    this.registerIPCTLSBootstrapIPCHandlers();
    this.registerIPCTLSAPIIPCHandlers();
    this.registerUserAuthAPIIPCHandlers();
    this.registerUserAccountStorageAPIIPCHandlers();
    this.registerUserDataStorageConfigAPIIPCHandlers();
    this.registerUserDataStorageVisibilityGroupAPIIPCHandlers();
    this.registerUtilsAPIIPCHandlers();
  }

  private registerIPCTLSBootstrapIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC TLS Bootstrap IPC handlers.");
    ipcMain.handle(
      IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.generateAndGetMainProcessIPCTLSPublicRSAKeyDER,
      async (): Promise<IPCAPIResponse<ArrayBuffer>> => {
        this.IPCTLSBootstrapAPILogger.debug(
          `Handling message from renderer on channel: "${IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.generateAndGetMainProcessIPCTLSPublicRSAKeyDER}".`
        );
        return await this.IPC_TLS_BOOTSTRAP_API_HANDLERS.handleGenerateAndGetMainProcessIPCTLSPublicRSAKeyDER();
      }
    );
    ipcMain.on(
      IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.sendWrappedIPCTLSAESKey,
      (_: IpcMainEvent, wrappedIPCTLSAESKeyIPCAPIResponse: IPCAPIResponse<ArrayBuffer>): void => {
        this.IPCTLSBootstrapAPILogger.debug(
          `Received message from renderer on channel: "${IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.sendWrappedIPCTLSAESKey}".`
        );
        void this.IPC_TLS_BOOTSTRAP_API_HANDLERS.handleSendWrappedIPCTLSAESKey(wrappedIPCTLSAESKeyIPCAPIResponse);
      }
    );
  }

  private registerIPCTLSAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC TLS IPC handlers.");
    ipcMain.on(IPC_TLS_API_IPC_CHANNELS.getMainReadiness, (event: IpcMainEvent): void => {
      this.IPCTLSBootstrapAPILogger.debug(`Received message from renderer on channel: "${IPC_TLS_API_IPC_CHANNELS.getMainReadiness}".`);
      event.returnValue = this.IPC_TLS_API_HANDLERS.handleGetMainReadiness();
    });
  }

  private registerUserAuthAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Auth API IPC handlers.");
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.isUsernameAvailable, (event: IpcMainEvent, username: string): void => {
      this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.isUsernameAvailable}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signUp, (event: IpcMainEvent, encryptedUserSignUpData: IEncryptedData<IUserSignUpDTO>): void => {
      this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signUp}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignUp(encryptedUserSignUpData);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signIn, (event: IpcMainEvent, encryptedUserSignInData: IEncryptedData<IUserSignInDTO>): void => {
      this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signIn}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignIn(encryptedUserSignInData);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signOut, (event: IpcMainEvent): void => {
      this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signOut}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.getSignedInUserInfo, (event: IpcMainEvent): void => {
      this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.getSignedInUserInfo}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleGetSignedInUserInfo();
    });
  }

  private registerUserAccountStorageAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Account Storage API IPC handlers.");
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.isUserAccountStorageOpen, (event: IpcMainEvent): void => {
      this.UserAccountStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.isUserAccountStorageOpen}".`
      );
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleIsUserAccountStorageOpen();
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserCount, (event: IpcMainEvent): void => {
      this.UserAccountStorageAPILogger.debug(`Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserCount}".`);
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUsernameForUserId, (event: IpcMainEvent, userId: string): void => {
      this.UserAccountStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUsernameForUserId}".`
      );
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleGetUsernameForUserId(userId);
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserAccountStorageInfo, (event: IpcMainEvent): void => {
      this.UserAccountStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserAccountStorageInfo}".`
      );
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleGetUserAccountStorageInfo();
    });
  }

  private registerUserDataStorageConfigAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Storage Config API IPC handlers.");
    ipcMain.on(
      USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.addUserDataStorageConfig,
      (event: IpcMainEvent, encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>): void => {
        this.UserDataStorageConfigAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.addUserDataStorageConfig}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.handleAddUserDataStorageConfig(encryptedUserDataStorageConfigCreateDTO);
      }
    );
    ipcMain.on(USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.getAllSignedInUserAvailableDataStorageConfigsInfo, (event: IpcMainEvent): void => {
      this.UserDataStorageConfigAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.getAllSignedInUserAvailableDataStorageConfigsInfo}".`
      );
      event.returnValue = this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.handleGetAllSignedInUserAvailableDataStorageConfigsInfo();
    });
  }

  private registerUserDataStorageVisibilityGroupAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Storage Visibility Group API IPC handlers.");
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser,
      (event: IpcMainEvent, name: string): void => {
        this.UserDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser}".`
        );
        event.returnValue =
          this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleIsUserDataStorageVisibilityGroupNameAvailableForSignedInUser(name);
      }
    );
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.addUserDataStorageVisibilityGroupConfig,
      (
        event: IpcMainEvent,
        encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
      ): void => {
        this.UserDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.addUserDataStorageVisibilityGroupConfig}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleAddUserDataStorageVisibilityGroupConfig(
          encryptedUserDataStorageVisibilityGroupConfigCreateDTO
        );
      }
    );
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.openUserDataStorageVisibilityGroups,
      (
        event: IpcMainEvent,
        encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
      ): void => {
        this.UserDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.openUserDataStorageVisibilityGroups}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleOpenUserDataStorageVisibilityGroups(
          encryptedUserDataStorageVisibilityGroupsOpenRequestDTO
        );
      }
    );
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups,
      (event: IpcMainEvent, userDataStorageVisibilityGroupIds: string[]): void => {
        this.UserDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups}".`
        );
        event.returnValue =
          this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleCloseUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupIds);
      }
    );
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo,
      (event: IpcMainEvent): void => {
        this.UserDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleGetAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
      }
    );
  }

  private registerUtilsAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering Utils API IPC handlers.");
    ipcMain.handle(
      UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker,
      async (_: IpcMainInvokeEvent, options: IGetDirectoryPathWithPickerOptions): Promise<IPCAPIResponse<IEncryptedData<string> | null>> => {
        this.UserAuthAPILogger.debug(`Received message from renderer on channel: "${UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker}".`);
        return await this.UTILS_API_HANDLERS.handleGetDirectoryPathWithPicker(options);
      }
    );
  }
}
