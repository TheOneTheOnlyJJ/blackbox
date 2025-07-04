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
import { IUserDataStorageAPI, USER_DATA_STORAGE_API_IPC_CHANNELS, UserDataStorageAPIIPCChannel } from "@shared/IPC/APIs/UserDataStorageAPI";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataBoxAPI, USER_DATA_BOX_API_IPC_CHANNELS, UserDataBoxAPIIPCChannel } from "@shared/IPC/APIs/UserDataBoxAPI";
import {
  isValidUserDataBoxNameAvailabilityRequest,
  IUserDataBoxNameAvailabilityRequest
} from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";
import { isValidUserDataBoxConfigCreateDTO, IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserAccountStorageHandlers } from "./user/account/storage/UserAccountStorage";
import {
  isValidUserDataStorageNameAvailabilityRequest,
  IUserDataStorageNameAvailabilityRequest
} from "@shared/user/data/storage/config/create/UserDataStorageNameAvailabilityRequest";
import { IUserDataTemplateAPI, USER_DATA_TEMPLATE_API_IPC_CHANNELS, UserDataTemplateAPIIPCChannel } from "@shared/IPC/APIs/UserDataTemplateAPI";
import {
  isValidUserDataTemplateNameAvailabilityRequest,
  IUserDataTemplateNameAvailabilityRequest
} from "@shared/user/data/template/config/create/UserDataTemplateNameAvailabilityRequest";
import {
  isValidUserDataTemplateConfigCreateDTO,
  IUserDataTemplateConfigCreateDTO
} from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { IUserDataEntryAPI, USER_DATA_ENTRY_API_IPC_CHANNELS, UserDataEntryAPIIPCChannel } from "@shared/IPC/APIs/UserDataEntryAPI";
import { isValidUserDataEntryCreateDTO, IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";

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
type MainProcessUserDataStorageAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataStorageAPI>;
type MainProcessUserDataStorageVisibilityGroupAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataStorageVisibilityGroupAPI>;
type MainProcessUserDataBoxAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataBoxAPI>;
type MainProcessUserDataTemplateAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataTemplateAPI>;
type MainProcessUserDataEntryAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserDataEntryAPI>;
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
  private readonly userAuthAPILogger: LogFunctions = log.scope("m-uauth-api");
  private readonly userAccountStorageAPILogger: LogFunctions = log.scope("m-uacc-strg-api");
  private readonly userDataStorageConfigAPILogger: LogFunctions = log.scope("m-udata-strg-cfg-api");
  private readonly userDataStorageAPILogger: LogFunctions = log.scope("m-udata-strg-api");
  private readonly userDataStorageVisibilityGroupAPILogger: LogFunctions = log.scope("m-udata-strg-vgrp-api");
  private readonly userDataBoxAPILogger: LogFunctions = log.scope("m-udata-box-api");
  private readonly userDataTemplateAPILogger: LogFunctions = log.scope("m-udata-tmpl-api");
  private readonly userDataEntryAPILogger: LogFunctions = log.scope("m-udata-ent-api");
  private readonly utilsAPILogger: LogFunctions = log.scope("m-utls-api");

  private readonly userFacadeLogger: LogFunctions = log.scope("m-usr-fac");
  private readonly userContextProviderLogger: LogFunctions = log.scope("m-uctx-prvdr");
  private readonly USER_CONTEXT_LOGGERS: IUserContextLoggers = {
    main: log.scope("m-uctx"),
    subcontexts: {
      accountStorage: log.scope("m-uacc-strg-ctx"),
      auth: log.scope("m-uauth-ctx"),
      availableDataStorageConfigs: log.scope("m-avail-udata-strg-cfg-ctx"),
      openDataStorageVisibilityGroups: log.scope("m-opn-udata-strg-vgrp-ctx"),
      initialisedDataStorages: log.scope("m-init-udata-strg-ctx"),
      availableDataBoxes: log.scope("m-avail-udata-box-ctx"),
      availableDataTemplates: log.scope("m-avail-udata-tmpl-ctx"),
      availableDataEntries: log.scope("m-avail-udata-ent-ctx")
    }
  } as const;
  private readonly USER_SERVICE_LOGGERS: IUserServiceLoggers = {
    auth: log.scope("m-uauth-svc"),
    account: log.scope("m-uacc-svc"),
    accountStorage: log.scope("m-uacc-strg-svc"),
    dataStorageConfig: log.scope("m-udata-strg-cfg-svc"),
    dataStorage: log.scope("m-udata-strg-svc"),
    dataStorageVisibilityGroup: log.scope("m-udata-strg-vgrp-svc"),
    dataBox: log.scope("m-udata-box-svc"),
    dataTemplate: log.scope("m-udata-tmpl-svc"),
    dataEntry: log.scope("m-udata-ent-svc")
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
              this.userAuthAPILogger,
              "user sign up DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAuthAPILogger.error(`Sign up error: ${ERROR_MESSAGE}!`);
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
              this.userAuthAPILogger,
              "user sign in DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAuthAPILogger.error(`Sign in error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse<ISignedInUserInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.signOutUser() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAuthAPILogger.error(`Sign out error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.isUsernameAvailable(username) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAuthAPILogger.error(`Is username available error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetSignedInUserInfo: (): IPCAPIResponse<ISignedInUserInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getSignedInUserInfo() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAuthAPILogger.error(`Get signed in user error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendSignedInUserChanged: (newSignedInUserInfo: ISignedInUserInfo | null): void => {
      this.userAuthAPILogger.debug(`Sending window signed in user info after change: ${JSON.stringify(newSignedInUserInfo, null, 2)}.`);
      if (this.window === null) {
        this.userAuthAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAuthAPIIPCChannel = USER_AUTH_API_IPC_CHANNELS.onSignedInUserChanged;
      this.userAuthAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newSignedInUserInfo);
    }
  } as const;

  private readonly USER_ACCOUNT_STORAGE_API_HANDLERS: MainProcessUserAccountStorageAPIIPCHandlers = {
    handleIsUserAccountStorageOpen: (): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.isAccountStorageOpen() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAccountStorageAPILogger.error(`Is User Account Storage open error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getUserCount() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAccountStorageAPILogger.error(`Get user count error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUsernameForUserId: (userId: string): IPCAPIResponse<string | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getUsernameForUserId(userId as UUID) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAccountStorageAPILogger.error(`Get username for user ID error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserAccountStorageInfo: (): IPCAPIResponse<IUserAccountStorageInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userFacade.getAccountStorageInfo() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userAccountStorageAPILogger.error(`Get User Account Storage Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendUserAccountStorageChanged: (newUserAccountStorageInfo: IUserAccountStorageInfo | null): void => {
      this.userAccountStorageAPILogger.debug(
        `Sending window public User Account Storage Info after change: ${JSON.stringify(newUserAccountStorageInfo, null, 2)}.`
      );
      if (this.window === null) {
        this.userAccountStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageChanged;
      this.userAccountStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newUserAccountStorageInfo);
    },
    sendUserAccountStorageInfoChanged: (newUserAccountStorageInfo: Readonly<IUserAccountStorageInfo>): void => {
      this.userAccountStorageAPILogger.debug(
        `Sending window User Account Storage open status after change: ${JSON.stringify(newUserAccountStorageInfo, null, 2).toString()}.`
      );
      if (this.window === null) {
        this.userAccountStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageInfoChanged;
      this.userAccountStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
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
              this.userDataStorageConfigAPILogger,
              "User Data Storage Config Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageConfigAPILogger.error(`Add User Data Storage Config error: ${ERROR_MESSAGE}!`);
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
            this.userDataStorageConfigAPILogger,
            "all signed in user's available User Data Storage Configs Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageConfigAPILogger.error(`Get all signed in user's available User Data Storage Configs Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAvailableUserDataStorageConfigsChanged: (
      availableUserDataStorageConfigsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageConfigInfo>
    ): void => {
      this.userDataStorageConfigAPILogger.debug(
        `Sending window available User Data Storage Configs Info Changed Diff. Removals: ${availableUserDataStorageConfigsInfoChangedDiff.removed.length.toString()}. Additions: ${availableUserDataStorageConfigsInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataStorageConfigAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.onAvailableUserDataStorageConfigsChanged;
      this.userDataStorageConfigAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<string, IUserDataStorageConfigInfo>>(
          availableUserDataStorageConfigsInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataStorageConfigAPILogger,
          "available User Data Storage Configs Info Changed Diff"
        )
      );
    },
    sendAvailableUserDataStorageConfigInfoChanged: (userDataStorageConfigInfo: IUserDataStorageConfigInfo): void => {
      this.userDataStorageConfigAPILogger.debug(
        `Sending window new Info of available User Data Storage Config "${userDataStorageConfigInfo.storageId}".`
      );
      if (this.window === null) {
        this.userDataStorageConfigAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.onAvailableUserDataStorageConfigInfoChanged;
      this.userDataStorageConfigAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IUserDataStorageConfigInfo>(
          userDataStorageConfigInfo,
          this.IPC_TLS_AES_KEY.value,
          this.userDataStorageConfigAPILogger,
          `new Info of available User Data Storage Config "${userDataStorageConfigInfo.storageId}"`
        )
      );
    }
  };

  private readonly USER_DATA_STORAGE_API_HANDLERS: MainProcessUserDataStorageAPIIPCHandlers = {
    handleIsUserDataStorageNameAvailable: (
      encryptedUserDataStorageNameAvailabilityRequest: IEncryptedData<IUserDataStorageNameAvailabilityRequest>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.isUserDataStorageNameAvailable(
            decryptWithAESAndValidateJSON<IUserDataStorageNameAvailabilityRequest>(
              encryptedUserDataStorageNameAvailabilityRequest,
              isValidUserDataStorageNameAvailabilityRequest,
              this.IPC_TLS_AES_KEY.value,
              this.userDataStorageAPILogger,
              "User Data Storage name availability request"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Get User Data Storage name availability error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleInitialiseUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<boolean>(
            this.userFacade.initialiseUserDataStorage(storageId as UUID),
            this.IPC_TLS_AES_KEY.value,
            this.userDataStorageAPILogger,
            "User Data Storage initialisation result"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Initialise User Data Storage error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleTerminateUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<boolean>(
            this.userFacade.terminateUserDataStorage(storageId as UUID),
            this.IPC_TLS_AES_KEY.value,
            this.userDataStorageAPILogger,
            "User Data Storage termination result"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Terminate User Data Storage error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleOpenUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<boolean>(
            this.userFacade.openUserDataStorage(storageId as UUID),
            this.IPC_TLS_AES_KEY.value,
            this.userDataStorageAPILogger,
            "open User Data Storage result"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Open User Data Storage error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleCloseUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<boolean>(
            this.userFacade.closeUserDataStorage(storageId as UUID),
            this.IPC_TLS_AES_KEY.value,
            this.userDataStorageAPILogger,
            "close User Data Storage result"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Close User Data Storage error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserInitialisedDataStoragesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataStorageInfo[]>(
            this.userFacade.getAllSignedInUserInitialisedDataStoragesInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.userDataStorageAPILogger,
            "all signed in user's initialised User Data Storages Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageAPILogger.error(`Get all signed in user's initialised User Data Storages Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendInitialisedUserDataStoragesChanged: (initialisedUserDataStoragesInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageInfo>): void => {
      this.userDataStorageAPILogger.debug(
        `Sending window initialised User Data Storages Info Changed Diff. Removals: ${initialisedUserDataStoragesInfoChangedDiff.removed.length.toString()}. Additions: ${initialisedUserDataStoragesInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.onInitialisedUserDataStoragesChanged;
      this.userDataStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<string, IUserDataStorageInfo>>(
          initialisedUserDataStoragesInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataStorageAPILogger,
          "initialised User Data Storages Info Changed Diff"
        )
      );
    },
    sendInitialisedUserDataStorageInfoChanged: (userDataStorageInfo: IUserDataStorageInfo): void => {
      this.userDataStorageAPILogger.debug(`Sending window new Info of initialised User Data Storage "${userDataStorageInfo.storageId}".`);
      if (this.window === null) {
        this.userDataStorageAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.onInitialisedUserDataStorageInfoChanged;
      this.userDataStorageAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IUserDataStorageInfo>(
          userDataStorageInfo,
          this.IPC_TLS_AES_KEY.value,
          this.userDataStorageAPILogger,
          `new Info of initialised User Data Storage "${userDataStorageInfo.storageId}"`
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
        this.userDataStorageVisibilityGroupAPILogger.error(
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
              this.userDataStorageVisibilityGroupAPILogger,
              "User Data Storage Visibility Group Config Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageVisibilityGroupAPILogger.error(`Add User Data Storage Visibility Group error: ${ERROR_MESSAGE}!`);
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
              this.userDataStorageVisibilityGroupAPILogger,
              "User Data Storage Visibility Group DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageVisibilityGroupAPILogger.error(`Open User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
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
        this.userDataStorageVisibilityGroupAPILogger.error(`Close User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
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
            this.userDataStorageVisibilityGroupAPILogger,
            "all signed in user's open User Data Storage Visibility Groups Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataStorageVisibilityGroupAPILogger.error(
          `Get all signed in user's open User Data Storage Visibility Groups Info error: ${ERROR_MESSAGE}!`
        );
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendOpenUserDataStorageVisibilityGroupsChanged: (
      userDataStorageVisibilityGroupsInfoChangedDiff: IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>
    ): void => {
      this.userDataStorageVisibilityGroupAPILogger.debug(
        `Sending window open User Data Storages Visibility Groups Info Changed Diff. Removals: ${userDataStorageVisibilityGroupsInfoChangedDiff.removed.length.toString()}. Additions: ${userDataStorageVisibilityGroupsInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataStorageVisibilityGroupAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
        USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.onOpenUserDataStorageVisibilityGroupsChanged;
      this.userDataStorageVisibilityGroupAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>(
          userDataStorageVisibilityGroupsInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataStorageVisibilityGroupAPILogger,
          "open User Data Storage Visibility Groups Info Changed Diff"
        )
      );
    }
  } as const;

  private readonly USER_DATA_BOX_API_HANDLERS: MainProcessUserDataBoxAPIIPCHandlers = {
    handleIsUserDataBoxNameAvailableForUserDataStorage: (
      encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.isUserDataBoxNameAvailableForUserDataStorage(
            decryptWithAESAndValidateJSON<IUserDataBoxNameAvailabilityRequest>(
              encryptedUserDataBoxNameAvailabilityRequest,
              isValidUserDataBoxNameAvailabilityRequest,
              this.IPC_TLS_AES_KEY.value,
              this.userDataBoxAPILogger,
              "User Data Box name availability request"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataBoxAPILogger.error(`Get User Data Box name availability for User Data Storage error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataBoxConfig: (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.addSecuredUserDataBoxConfigFromCreateDTO(
            decryptWithAESAndValidateJSON<IUserDataBoxConfigCreateDTO>(
              encryptedUserDataBoxConfigCreateDTO,
              isValidUserDataBoxConfigCreateDTO,
              this.IPC_TLS_AES_KEY.value,
              this.userDataBoxAPILogger,
              "User Data Box Config Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataBoxAPILogger.error(`Add User Data Box Config error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserAvailableUserDataBoxesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataBoxInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataBoxInfo[]>(
            this.userFacade.getAllSignedInUserAvailableUserDataBoxesInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.userDataBoxAPILogger,
            "all signed in user's available User Data Boxes Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataBoxAPILogger.error(`Get all signed in user's User Data Boxes Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAvailableUserDataBoxesChanged: (userDataBoxesInfoChangedDiff: IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>): void => {
      this.userDataBoxAPILogger.debug(
        `Sending window available User Data Boxes Info Changed Diff. Removals: ${userDataBoxesInfoChangedDiff.removed.length.toString()}. Additions: ${userDataBoxesInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataBoxAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.onAvailableUserDataBoxesChanged;
      this.userDataBoxAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBoxInfo>>(
          userDataBoxesInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataBoxAPILogger,
          "available User Data Boxes Info Changed Diff"
        )
      );
    }
  };

  private readonly USER_DATA_TEMPLATE_API_HANDLERS: MainProcessUserDataTemplateAPIIPCHandlers = {
    handleIsUserDataTemplateNameAvailable: (
      encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.isUserDataTemplateNameAvailable(
            decryptWithAESAndValidateJSON<IUserDataTemplateNameAvailabilityRequest>(
              encryptedUserDataTemplateNameAvailabilityRequest,
              isValidUserDataTemplateNameAvailabilityRequest,
              this.IPC_TLS_AES_KEY.value,
              this.userDataTemplateAPILogger,
              "User Data Template name availability request"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataTemplateAPILogger.error(`Get User Data Template name availability error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataTemplateConfig: (
      encryptedUserDataTemplateConfigCreateDTO: IEncryptedData<IUserDataTemplateConfigCreateDTO>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.addSecuredUserDataTemplateConfigFromCreateDTO(
            decryptWithAESAndValidateJSON<IUserDataTemplateConfigCreateDTO>(
              encryptedUserDataTemplateConfigCreateDTO,
              isValidUserDataTemplateConfigCreateDTO,
              this.IPC_TLS_AES_KEY.value,
              this.userDataTemplateAPILogger,
              "User Data Template Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataTemplateAPILogger.error(`Add User Data Template error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserAvailableUserDataTemplatesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataTemplateInfo[]>(
            this.userFacade.getAllSignedInUserAvailableUserDataTemplatesInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.userDataTemplateAPILogger,
            "all signed in user's available User Data Templates Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataTemplateAPILogger.error(`Get all signed in user's User Data Templates Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAvailableUserDataTemplatesChanged: (
      availableUserDataTemplatesInfoChangedDiff: IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>
    ) => {
      this.userDataTemplateAPILogger.debug(
        `Sending window available User Data Templates Info Changed Diff. Removals: ${availableUserDataTemplatesInfoChangedDiff.removed.length.toString()}. Additions: ${availableUserDataTemplatesInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataTemplateAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataTemplateAPIIPCChannel = USER_DATA_TEMPLATE_API_IPC_CHANNELS.onAvailableUserDataTemplatesChanged;
      this.userDataTemplateAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataBoxInfo>>(
          availableUserDataTemplatesInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataTemplateAPILogger,
          "available User Data Templates Info Changed Diff"
        )
      );
    }
  };

  private readonly USER_DATA_ENTRY_API_HANDLERS: MainProcessUserDataEntryAPIIPCHandlers = {
    handleAddUserDataEntry: (encryptedUserDataEntryCreateDTO: IEncryptedData<IUserDataEntryCreateDTO>): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userFacade.addUserDataEntryFromCreateDTO(
            decryptWithAESAndValidateJSON<IUserDataEntryCreateDTO>(
              encryptedUserDataEntryCreateDTO,
              isValidUserDataEntryCreateDTO,
              this.IPC_TLS_AES_KEY.value,
              this.userDataEntryAPILogger,
              "User Data Entry Create DTO"
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataEntryAPILogger.error(`Add User Data Entry error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserAvailableUserDataEntriesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataEntryInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataEntryInfo[]>(
            this.userFacade.getAllSignedInUserAvailableUserDataEntriesInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.userDataEntryAPILogger,
            "all signed in user's available User Data Entries Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.userDataEntryAPILogger.error(`Get all signed in user's User Data Entries Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendAvailableUserDataEntriesChanged: (
      availableUserDataEntriesInfoChangedDiff: IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>
    ) => {
      this.userDataEntryAPILogger.debug(
        `Sending window available User Data Entries Info Changed Diff. Removals: ${availableUserDataEntriesInfoChangedDiff.removed.length.toString()}. Additions: ${availableUserDataEntriesInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.userDataEntryAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserDataEntryAPIIPCChannel = USER_DATA_ENTRY_API_IPC_CHANNELS.onAvailableUserDataEntriesChanged;
      this.userDataEntryAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>>(
          availableUserDataEntriesInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.userDataEntryAPILogger,
          "available User Data Entries Info Changed Diff"
        )
      );
    }
  };

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
          data: encryptWithAES<string[]>(OPEN_DIALOG_RETURN_VALUE.filePaths, this.IPC_TLS_AES_KEY.value, this.utilsAPILogger, "picked directory path")
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.utilsAPILogger.error(`Get directory with picker error: ${ERROR_MESSAGE}!`);
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
      contextProviderLogger: this.userContextProviderLogger,
      contextLoggers: this.USER_CONTEXT_LOGGERS,
      serviceLoggers: this.USER_SERVICE_LOGGERS,
      contextHandlers: {
        onSignedInUserChangedCallback: this.USER_AUTH_API_HANDLERS.sendSignedInUserChanged,
        onUserAccountStorageChangedCallback: this.USER_ACCOUNT_STORAGE_API_HANDLERS.sendUserAccountStorageChanged,
        onAvailableSecuredUserDataStorageConfigsChangedCallback:
          this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.sendAvailableUserDataStorageConfigsChanged,
        onAvailableSecuredUserDataStorageConfigInfoChangedCallback:
          this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.sendAvailableUserDataStorageConfigInfoChanged,
        onOpenUserDataStorageVisibilityGroupsChangedCallback:
          this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.sendOpenUserDataStorageVisibilityGroupsChanged,
        onInitialisedUserDataStoragesChangedCallback: this.USER_DATA_STORAGE_API_HANDLERS.sendInitialisedUserDataStoragesChanged,
        onInitialisedUserDataStorageInfoChangedCallback: this.USER_DATA_STORAGE_API_HANDLERS.sendInitialisedUserDataStorageInfoChanged,
        onAvailableUserDataBoxesChanged: this.USER_DATA_BOX_API_HANDLERS.sendAvailableUserDataBoxesChanged,
        onAvailableUserDataTemplatesChanged: this.USER_DATA_TEMPLATE_API_HANDLERS.sendAvailableUserDataTemplatesChanged,
        onAvailableUserDataEntriesChanged: this.USER_DATA_ENTRY_API_HANDLERS.sendAvailableUserDataEntriesChanged
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
      // TODO: Move this entirely in user facade context
      {
        onInfoChanged: this.USER_ACCOUNT_STORAGE_API_HANDLERS.sendUserAccountStorageInfoChanged,
        onOpened: null,
        onClosed: null
      } satisfies IUserAccountStorageHandlers
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
    this.registerUserDataStorageAPIIPCHandlers();
    this.registerUserDataStorageVisibilityGroupAPIIPCHandlers();
    this.registerUserDataBoxAPIIPCHandlers();
    this.registerUserDataTemplateAPIIPCHandlers();
    this.registerUserDataEntryAPIIPCHandlers();
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
      this.userAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.isUsernameAvailable}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signUp, (event: IpcMainEvent, encryptedUserSignUpData: IEncryptedData<IUserSignUpDTO>): void => {
      this.userAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signUp}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignUp(encryptedUserSignUpData);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signIn, (event: IpcMainEvent, encryptedUserSignInData: IEncryptedData<IUserSignInDTO>): void => {
      this.userAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signIn}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignIn(encryptedUserSignInData);
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.signOut, (event: IpcMainEvent): void => {
      this.userAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.signOut}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(USER_AUTH_API_IPC_CHANNELS.getSignedInUserInfo, (event: IpcMainEvent): void => {
      this.userAuthAPILogger.debug(`Received message from renderer on channel: "${USER_AUTH_API_IPC_CHANNELS.getSignedInUserInfo}".`);
      event.returnValue = this.USER_AUTH_API_HANDLERS.handleGetSignedInUserInfo();
    });
  }

  private registerUserAccountStorageAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Account Storage API IPC handlers.");
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.isUserAccountStorageOpen, (event: IpcMainEvent): void => {
      this.userAccountStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.isUserAccountStorageOpen}".`
      );
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleIsUserAccountStorageOpen();
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserCount, (event: IpcMainEvent): void => {
      this.userAccountStorageAPILogger.debug(`Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserCount}".`);
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUsernameForUserId, (event: IpcMainEvent, userId: string): void => {
      this.userAccountStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUsernameForUserId}".`
      );
      event.returnValue = this.USER_ACCOUNT_STORAGE_API_HANDLERS.handleGetUsernameForUserId(userId);
    });
    ipcMain.on(USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserAccountStorageInfo, (event: IpcMainEvent): void => {
      this.userAccountStorageAPILogger.debug(
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
        this.userDataStorageConfigAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.addUserDataStorageConfig}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.handleAddUserDataStorageConfig(encryptedUserDataStorageConfigCreateDTO);
      }
    );
    ipcMain.on(USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.getAllSignedInUserAvailableDataStorageConfigsInfo, (event: IpcMainEvent): void => {
      this.userDataStorageConfigAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.getAllSignedInUserAvailableDataStorageConfigsInfo}".`
      );
      event.returnValue = this.USER_DATA_STORAGE_CONFIG_API_HANDLERS.handleGetAllSignedInUserAvailableDataStorageConfigsInfo();
    });
  }

  private registerUserDataStorageAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Storage API IPC handlers.");
    ipcMain.on(
      USER_DATA_STORAGE_API_IPC_CHANNELS.isUserDataStorageNameAvailable,
      (event: IpcMainEvent, encryptedUserDataStorageNameAvailabilityRequest: IEncryptedData<IUserDataStorageNameAvailabilityRequest>): void => {
        this.userDataStorageAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.isUserDataStorageNameAvailable}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleIsUserDataStorageNameAvailable(encryptedUserDataStorageNameAvailabilityRequest);
      }
    );
    ipcMain.on(USER_DATA_STORAGE_API_IPC_CHANNELS.initialiseUserDataStorage, (event: IpcMainEvent, storageId: string): void => {
      this.userDataStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.initialiseUserDataStorage}".`
      );
      event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleInitialiseUserDataStorage(storageId);
    });
    ipcMain.on(USER_DATA_STORAGE_API_IPC_CHANNELS.terminateUserDataStorage, (event: IpcMainEvent, storageId: string): void => {
      this.userDataStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.terminateUserDataStorage}".`
      );
      event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleTerminateUserDataStorage(storageId);
    });
    ipcMain.on(USER_DATA_STORAGE_API_IPC_CHANNELS.openUserDataStorage, (event: IpcMainEvent, storageId: string): void => {
      this.userDataStorageAPILogger.debug(`Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.openUserDataStorage}".`);
      event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleOpenUserDataStorage(storageId);
    });
    ipcMain.on(USER_DATA_STORAGE_API_IPC_CHANNELS.closeUserDataStorage, (event: IpcMainEvent, storageId: string): void => {
      this.userDataStorageAPILogger.debug(`Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.closeUserDataStorage}".`);
      event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleCloseUserDataStorage(storageId);
    });
    ipcMain.on(USER_DATA_STORAGE_API_IPC_CHANNELS.getAllSignedInUserInitialisedDataStoragesInfo, (event: IpcMainEvent): void => {
      this.userDataStorageAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_STORAGE_API_IPC_CHANNELS.getAllSignedInUserInitialisedDataStoragesInfo}".`
      );
      event.returnValue = this.USER_DATA_STORAGE_API_HANDLERS.handleGetAllSignedInUserInitialisedDataStoragesInfo();
    });
  }

  private registerUserDataStorageVisibilityGroupAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Storage Visibility Group API IPC handlers.");
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser,
      (event: IpcMainEvent, name: string): void => {
        this.userDataStorageVisibilityGroupAPILogger.debug(
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
        this.userDataStorageVisibilityGroupAPILogger.debug(
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
        this.userDataStorageVisibilityGroupAPILogger.debug(
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
        this.userDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups}".`
        );
        event.returnValue =
          this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleCloseUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupIds);
      }
    );
    ipcMain.on(
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo,
      (event: IpcMainEvent): void => {
        this.userDataStorageVisibilityGroupAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo}".`
        );
        event.returnValue = this.USER_DATA_STORAGE_VISIBILITY_GROUP_API_HANDLERS.handleGetAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
      }
    );
  }

  private registerUserDataBoxAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Box API IPC handlers.");
    ipcMain.on(
      USER_DATA_BOX_API_IPC_CHANNELS.isUserDataBoxNameAvailableForUserDataStorage,
      (event: IpcMainEvent, encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>): void => {
        this.userDataBoxAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_BOX_API_IPC_CHANNELS.isUserDataBoxNameAvailableForUserDataStorage}".`
        );
        event.returnValue = this.USER_DATA_BOX_API_HANDLERS.handleIsUserDataBoxNameAvailableForUserDataStorage(
          encryptedUserDataBoxNameAvailabilityRequest
        );
      }
    );
    ipcMain.on(
      USER_DATA_BOX_API_IPC_CHANNELS.addUserDataBoxConfig,
      (event: IpcMainEvent, encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>): void => {
        this.userDataBoxAPILogger.debug(`Received message from renderer on channel: "${USER_DATA_BOX_API_IPC_CHANNELS.addUserDataBoxConfig}".`);
        event.returnValue = this.USER_DATA_BOX_API_HANDLERS.handleAddUserDataBoxConfig(encryptedUserDataBoxConfigCreateDTO);
      }
    );
    ipcMain.on(USER_DATA_BOX_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataBoxesInfo, (event: IpcMainEvent): void => {
      this.userDataBoxAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_BOX_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataBoxesInfo}".`
      );
      event.returnValue = this.USER_DATA_BOX_API_HANDLERS.handleGetAllSignedInUserAvailableUserDataBoxesInfo();
    });
  }

  private registerUserDataTemplateAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Template API IPC handlers.");
    ipcMain.on(
      USER_DATA_TEMPLATE_API_IPC_CHANNELS.isUserDataTemplateNameAvailable,
      (event: IpcMainEvent, encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>): void => {
        this.userDataTemplateAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_TEMPLATE_API_IPC_CHANNELS.isUserDataTemplateNameAvailable}".`
        );
        event.returnValue = this.USER_DATA_TEMPLATE_API_HANDLERS.handleIsUserDataTemplateNameAvailable(
          encryptedUserDataTemplateNameAvailabilityRequest
        );
      }
    );
    ipcMain.on(
      USER_DATA_TEMPLATE_API_IPC_CHANNELS.addUserDataTemplateConfig,
      (event: IpcMainEvent, encryptedUserDataTemplateCreateDTO: IEncryptedData<IUserDataTemplateConfigCreateDTO>): void => {
        this.userDataTemplateAPILogger.debug(
          `Received message from renderer on channel: "${USER_DATA_TEMPLATE_API_IPC_CHANNELS.addUserDataTemplateConfig}".`
        );
        event.returnValue = this.USER_DATA_TEMPLATE_API_HANDLERS.handleAddUserDataTemplateConfig(encryptedUserDataTemplateCreateDTO);
      }
    );
    ipcMain.on(USER_DATA_TEMPLATE_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataTemplatesInfo, (event: IpcMainEvent): void => {
      this.userDataTemplateAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_TEMPLATE_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataTemplatesInfo}".`
      );
      event.returnValue = this.USER_DATA_TEMPLATE_API_HANDLERS.handleGetAllSignedInUserAvailableUserDataTemplatesInfo();
    });
  }

  private registerUserDataEntryAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User Data Entry API IPC handlers.");
    ipcMain.on(
      USER_DATA_ENTRY_API_IPC_CHANNELS.addUserDataEntry,
      (event: IpcMainEvent, encryptedUserDataEntryCreateDTO: IEncryptedData<IUserDataEntryCreateDTO>): void => {
        this.userDataEntryAPILogger.debug(`Received message from renderer on channel: "${USER_DATA_ENTRY_API_IPC_CHANNELS.addUserDataEntry}".`);
        event.returnValue = this.USER_DATA_ENTRY_API_HANDLERS.handleAddUserDataEntry(encryptedUserDataEntryCreateDTO);
      }
    );
    ipcMain.on(USER_DATA_ENTRY_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataEntriesInfo, (event: IpcMainEvent): void => {
      this.userDataEntryAPILogger.debug(
        `Received message from renderer on channel: "${USER_DATA_ENTRY_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataEntriesInfo}".`
      );
      event.returnValue = this.USER_DATA_ENTRY_API_HANDLERS.handleGetAllSignedInUserAvailableUserDataEntriesInfo();
    });
  }

  private registerUtilsAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering Utils API IPC handlers.");
    ipcMain.handle(
      UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker,
      async (_: IpcMainInvokeEvent, options: IGetDirectoryPathWithPickerOptions): Promise<IPCAPIResponse<IEncryptedData<string> | null>> => {
        this.userAuthAPILogger.debug(`Received message from renderer on channel: "${UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker}".`);
        return await this.UTILS_API_HANDLERS.handleGetDirectoryPathWithPicker(options);
      }
    );
  }
}
