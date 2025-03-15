import { app, globalShortcut, BrowserWindow, ipcMain, Rectangle, screen, dialog } from "electron/main";
import { BrowserWindowConstructorOptions, HandlerDetails, nativeImage, shell, WindowOpenHandlerResponse } from "electron/common";
import { join, resolve } from "node:path";
import log, { LogFunctions } from "electron-log";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { JSONSchemaType } from "ajv/dist/types/json-schema";
import { IIPCTLSBootstrapAPI, IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS } from "@shared/IPC/APIs/IPCTLSBootstrapAPI";
import { USER_API_IPC_CHANNELS, UserAPIIPCChannel } from "@shared/IPC/APIs/UserAPI";
import { UserManager } from "@main/user/UserManager";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@main/user/account/storage/backend/UserAccountStorageBackendType";
import { adjustWindowBounds } from "@main/utils/window/adjustWindowBounds";
import { IpcMainEvent, IpcMainInvokeEvent, OpenDialogReturnValue } from "electron";
import { IUserAPI } from "@shared/IPC/APIs/UserAPI";
import { MainProcessIPCAPIHandlers } from "@main/utils/IPC/MainProcessIPCAPIHandlers";
import { IUserSignUpDTO, USER_SIGN_UP_DTO_VALIDATE_FUNCTION } from "@shared/user/account/UserSignUpDTO";
import { generateKeyPairSync, UUID, webcrypto } from "node:crypto";
import { isAESKeyValid } from "@main/utils/encryption/isAESKeyValid";
import { bufferToArrayBuffer } from "@main/utils/typeConversions/bufferToArrayBuffer";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";
import { IUserSignInDTO, USER_SIGN_IN_DTO_VALIDATE_FUNCTION } from "@shared/user/account/UserSignInDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { settingsManagerFactory } from "@main/settings/settingsManagerFactory";
import { SETTINGS_MANAGER_TYPE } from "@main/settings/SettingsManagerType";
import { WINDOW_STATES, WindowPosition, WindowPositionWatcher, WindowStates } from "@main/settings/WindowPositionWatcher";
import {
  IUserDataStorageConfigCreateDTO,
  USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION
} from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { userDataStorageConfigCreateDTOToUserDataStorageConfig } from "./user/data/storage/config/utils/userDataStorageConfigCreateDTOToUserDataStorageConfig";
import { IIPCTLSAPIMain, IPC_TLS_API_IPC_CHANNELS, IPCTLSAPIIPCChannel } from "@shared/IPC/APIs/IPCTLSAPI";
import { userSignInDTOToUserSignInPayload } from "./user/account/utils/userSignInDTOToUserSignInPayload";
import { userSignUpDTOToUserSignUpPayload } from "./user/account/utils/userSignUpDTOToUserSignUpPayload";
import { IUserAccountStorageConfig } from "./user/account/storage/config/UserAccountStorageConfig";
import { UserAccountStorage } from "./user/account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { SettingsManager } from "./settings/SettingsManager";
import { BaseSettings } from "./settings/BaseSettings";
import { SettingsManagerConfig } from "./settings/SettingsManagerConfig";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { encryptWithAES } from "./utils/encryption/encryptWithAES";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IGetDirectoryWithPickerOptions, IUtilsAPI, UTILS_API_IPC_CHANNELS } from "@shared/IPC/APIs/UtilsAPI";
import {
  IUserDataStorageVisibilityGroupCreateDTO,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO_VALIDATE_FUNCTION
} from "@shared/user/data/storage/visibilityGroup/create/DTO/UserDataStorageVisibilityGroupCreateDTO";
import { userDataStorageVisibilityGroupCreateDTOToUserDataStorageVisibilityGroup } from "./user/data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupCreateDTOToUserDataStorageVisibilityGroup";
import {
  IUserDataStorageVisibilityGroupsOpenRequestDTO,
  USER_DATA_STORAGE_VISIBILITY_GROUPS_OPEN_REQUEST_DTO_VALIDATE_FUNCTION
} from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest } from "./user/data/storage/visibilityGroup/openRequest/utils/userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "./user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";

type WindowPositionSetting = Rectangle | WindowStates["FullScreen"] | WindowStates["Maximized"];

interface IWindowSettings extends BaseSettings {
  position: WindowPositionSetting;
}

export interface IAppSettings extends BaseSettings {
  window: IWindowSettings;
}

type MainProcessIPCTLSBootstrapAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSBootstrapAPI>;
type MainProcessIPCTLSAPIIPCHandlers = MainProcessIPCAPIHandlers<IIPCTLSAPIMain>;
type MainProcessUserAPIIPCHandlers = MainProcessIPCAPIHandlers<IUserAPI>;
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

  private readonly bootstrapLogger: LogFunctions = log.scope("main-bootstrap");
  private readonly appLogger: LogFunctions = log.scope("main-app");
  private readonly windowLogger: LogFunctions = log.scope("main-window");
  private readonly windowPositionWatcherLogger: LogFunctions = log.scope("main-window-position-watcher");
  private readonly settingsManagerLogger: LogFunctions = log.scope("main-settings-manager");
  private readonly IPCTLSBootstrapAPILogger: LogFunctions = log.scope("main-ipc-tls-bootstrap-api");
  private readonly IPCTLSAPILogger: LogFunctions = log.scope("main-ipc-tls-api");
  private readonly UserAPILogger: LogFunctions = log.scope("main-user-api");
  private readonly UtilsAPILogger: LogFunctions = log.scope("main-utils-api");
  private readonly userManagerLogger: LogFunctions = log.scope("main-user-manager");
  private readonly userAccountStorageLogger: LogFunctions = log.scope("main-user-account-storage");
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
  private readonly settingsManager: SettingsManager<IAppSettings>;
  private readonly SETTINGS_MANAGER_CONFIG: SettingsManagerConfig = {
    type: SETTINGS_MANAGER_TYPE.LocalJSON,
    doSaveOnUpdate: false,
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
  private readonly DEFAULT_USER_ACCOUNT_STORAGE_CONFIG: IUserAccountStorageConfig = {
    storageId: "00000000-0000-0000-0000-000000000000",
    name: "Default",
    backendConfig: {
      type: USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite,
      dbDirPath: resolve(join(app.getAppPath(), "data")),
      dbFileName: "users.sqlite"
    }
  } as const;

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
        const UNWRAPPED_IPO_TLS_AES_KEY: CryptoKey = await webcrypto.subtle.unwrapKey(
          "raw",
          wrappedIPCTLSAESKeyIPCAPIResponse.data,
          this.IPCTLSBootstrapPrivateRSAKey,
          { name: "RSA-OAEP" },
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        const EXPORTED_IPC_TLS_AES_KEY: ArrayBuffer = await webcrypto.subtle.exportKey("raw", UNWRAPPED_IPO_TLS_AES_KEY);
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

  private readonly USER_API_HANDLERS: MainProcessUserAPIIPCHandlers = {
    handleSignUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.signUpUser(
            userSignUpDTOToUserSignUpPayload(
              decryptWithAESAndValidateJSON<IUserSignUpDTO>(
                encryptedUserSignUpDTO,
                USER_SIGN_UP_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "user sign up DTO"
              ),
              this.userManager.generateRandomUserId(),
              this.UserAPILogger
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Sign up error: ${ERROR_MESSAGE}!`);
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
          data: this.userManager.signInUser(
            userSignInDTOToUserSignInPayload(
              decryptWithAESAndValidateJSON<IUserSignInDTO>(
                encryptedUserSignInDTO,
                USER_SIGN_IN_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "user sign in data"
              ),
              this.UserAPILogger
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Sign in error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleSignOut: (): IPCAPIResponse<IPublicSignedInUser | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.signOutUser() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Sign out error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUserAccountStorageOpen: (): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.isUserAccountStorageOpen() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Is User Account Storage open error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleIsUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.isUsernameAvailable(username) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Is username available error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserCount: (): IPCAPIResponse<number> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getUserCount() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get user count error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUsernameForUserId: (userId: string): IPCAPIResponse<string | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getUsernameForUserId(userId as UUID) };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get username for user ID error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetSignedInUser: (): IPCAPIResponse<IPublicSignedInUser | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getPublicSignedInUser() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get signed in user error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataStorageConfig: (
      encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.addUserDataStorageConfig(
            userDataStorageConfigCreateDTOToUserDataStorageConfig(
              decryptWithAESAndValidateJSON<IUserDataStorageConfigCreateDTO>(
                encryptedUserDataStorageConfigCreateDTO,
                USER_DATA_STORAGE_CONFIG_CREATE_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "User Data Storage Config Create DTO"
              ),
              this.userManager.generateRandomUserDataStorageId(),
              this.UserAPILogger
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Add User Data Storage Config error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleAddUserDataStorageVisibilityGroup: (
      encryptedUserDataStorageVisibilityGroupCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupCreateDTO>
    ): IPCAPIResponse<boolean> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: this.userManager.addUserDataStorageVisibilityGroup(
            userDataStorageVisibilityGroupCreateDTOToUserDataStorageVisibilityGroup(
              decryptWithAESAndValidateJSON<IUserDataStorageVisibilityGroupCreateDTO>(
                encryptedUserDataStorageVisibilityGroupCreateDTO,
                USER_DATA_STORAGE_VISIBILITY_GROUP_CREATE_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "User Data Storage Visibility Group Create DTO"
              ),
              this.userManager.generateRandomUserDataStorageVisibilityGroupId(),
              USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.AESKeySalt.lengthBytes,
              this.UserAPILogger
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Add User Data Storage Visibility Group error: ${ERROR_MESSAGE}!`);
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
          data: this.userManager.openUserDataStorageVisibilityGroups(
            userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest(
              decryptWithAESAndValidateJSON<IUserDataStorageVisibilityGroupsOpenRequestDTO>(
                encryptedUserDataStorageVisibilityGroupsOpenRequestDTO,
                USER_DATA_STORAGE_VISIBILITY_GROUPS_OPEN_REQUEST_DTO_VALIDATE_FUNCTION,
                this.IPC_TLS_AES_KEY.value,
                this.UserAPILogger,
                "User Data Storage Visibility Group DTO"
              ),
              this.UserAPILogger
            )
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Open User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
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
          data: this.userManager.closeUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupIds as UUID[])
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Close User Data Storage Visibility Groups error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetUserAccountStorageInfo: (): IPCAPIResponse<IUserAccountStorageInfo | null> => {
      try {
        return { status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: this.userManager.getUserAccountStorageInfo() };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get User Account Storage Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    handleGetAllSignedInUserDataStoragesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> => {
      try {
        if (this.IPC_TLS_AES_KEY.value === null) {
          throw new Error("Null IPC TLS AES key");
        }
        return {
          status: IPC_API_RESPONSE_STATUSES.SUCCESS,
          data: encryptWithAES<IUserDataStorageInfo[]>(
            this.userManager.getAllSignedInUserDataStoragesInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.UserAPILogger,
            "all signed in user's User Data Storages Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get all signed in user's User Data Storages Info error: ${ERROR_MESSAGE}!`);
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
            this.userManager.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(),
            this.IPC_TLS_AES_KEY.value,
            this.UserAPILogger,
            "all signed in user's open User Data Storage Visibility Groups Info"
          )
        };
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        this.UserAPILogger.error(`Get all signed in user's open User Data Storage Visibility Groups Info error: ${ERROR_MESSAGE}!`);
        return { status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR, error: "An internal error occurred" };
      }
    },
    sendUserAccountStorageChanged: (newUserAccountStorageInfo: IUserAccountStorageInfo | null): void => {
      this.UserAPILogger.debug(
        `Sending window public User Account Storage Info after change: ${JSON.stringify(newUserAccountStorageInfo, null, 2)}.`
      );
      if (this.window === null) {
        this.UserAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onUserAccountStorageChanged;
      this.UserAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newUserAccountStorageInfo);
    },
    sendUserAccountStorageOpenChanged: (newIsUserAccountStorageOpen: boolean): void => {
      this.UserAPILogger.debug(`Sending window User Account Storage open status after change: ${newIsUserAccountStorageOpen.toString()}.`);
      if (this.window === null) {
        this.UserAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onUserAccountStorageOpenChanged;
      this.UserAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newIsUserAccountStorageOpen);
    },
    sendSignedInUserChanged: (newPublicSignedInUser: IPublicSignedInUser | null): void => {
      this.UserAPILogger.debug(`Sending window public signed in user after change: ${JSON.stringify(newPublicSignedInUser, null, 2)}.`);
      if (this.window === null) {
        this.UserAPILogger.debug("Window is null. No-op.");
        return;
      }
      const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onSignedInUserChanged;
      this.UserAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(CHANNEL, newPublicSignedInUser);
    },
    sendUserDataStoragesChanged: (userDataStoragesInfoChangedDiff: IUserDataStoragesInfoChangedDiff): void => {
      this.UserAPILogger.debug(
        `Sending window User Data Storages Info Changed Diff. Deletes: ${userDataStoragesInfoChangedDiff.deleted.length.toString()}. Additions: ${userDataStoragesInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.UserAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onUserDataStoragesChanged;
      this.UserAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IUserDataStoragesInfoChangedDiff>(
          userDataStoragesInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.UserAPILogger,
          "User Data Storages Info Changed Diff"
        )
      );
    },
    sendOpenUserDataStorageVisibilityGroupsChanged: (
      userDataStorageVisibilityGroupsInfoChangedDiff: IUserDataStorageVisibilityGroupsInfoChangedDiff
    ): void => {
      this.UserAPILogger.debug(
        `Sending window open User Data Storages Visibility Groups Info Changed Diff. Deletes: ${userDataStorageVisibilityGroupsInfoChangedDiff.deleted.length.toString()}. Additions: ${userDataStorageVisibilityGroupsInfoChangedDiff.added.length.toString()}.`
      );
      if (this.window === null) {
        this.UserAPILogger.debug("Window is null. No-op.");
        return;
      }
      if (this.IPC_TLS_AES_KEY.value === null) {
        throw new Error("Null IPC TLS AES key");
      }
      const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onOpenUserDataStorageVisibilityGroupsChanged;
      this.UserAPILogger.debug(`Messaging renderer on channel: "${CHANNEL}".`);
      this.window.webContents.send(
        CHANNEL,
        encryptWithAES<IUserDataStorageVisibilityGroupsInfoChangedDiff>(
          userDataStorageVisibilityGroupsInfoChangedDiff,
          this.IPC_TLS_AES_KEY.value,
          this.UserAPILogger,
          "open User Data Storage Visibility Groups Info Changed Diff"
        )
      );
    }
  } as const;

  private readonly UTILS_API_HANDLERS: MainProcessUtilsAPIIPCHandlers = {
    handleGetDirectoryPathWithPicker: async (options: IGetDirectoryWithPickerOptions): Promise<IPCAPIResponse<IEncryptedData<string[]> | null>> => {
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
    // Initialise required managers & watchers
    this.settingsManager = settingsManagerFactory<IAppSettings>(this.SETTINGS_MANAGER_CONFIG, App.SETTINGS_SCHEMA, this.settingsManagerLogger);
    this.windowPositionWatcher = new WindowPositionWatcher(this.windowPositionWatcherLogger);
    // Read app settings
    try {
      this.settingsManager.fetchSettings(true);
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.bootstrapLogger.error(`Fetch app settings error: ${ERROR_MESSAGE}!`);
      this.bootstrapLogger.warn("Using default app settings.");
      this.settingsManager.updateSettings(this.DEFAULT_SETTINGS);
    }
    this.bootstrapLogger.debug(`Using app settings: ${JSON.stringify(this.settingsManager.getSettings(), null, 2)}.`);
    this.userManager = new UserManager(
      this.userManagerLogger,
      this.USER_API_HANDLERS.sendSignedInUserChanged,
      this.USER_API_HANDLERS.sendUserAccountStorageChanged,
      this.USER_API_HANDLERS.sendUserAccountStorageOpenChanged,
      this.USER_API_HANDLERS.sendUserDataStoragesChanged,
      this.USER_API_HANDLERS.sendOpenUserDataStorageVisibilityGroupsChanged
    );
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
      lastWindowSettings = this.settingsManager.fetchSettings(false).window;
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
    this.settingsManager.saveSettings();
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
    this.userManager.setUserAccountStorage(
      new UserAccountStorage(this.DEFAULT_USER_ACCOUNT_STORAGE_CONFIG, this.userAccountStorageLogger, this.userAccountStorageBackendLogger)
    );
    this.userManager.openUserAccountStorage();
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
    this.userManager.signOutUser();
    this.appLogger.debug("Unregistering all global shortcuts.");
    globalShortcut.unregisterAll();
    if (this.userManager.isUserAccountStorageSet()) {
      if (this.userManager.isUserAccountStorageOpen()) {
        this.userManager.closeUserAccountStorage();
      } else {
        this.appLogger.debug("No User Account Storage open.");
      }
    } else {
      this.appLogger.debug("No User Account Storage set.");
    }
    this.appLogger.silly("Pre-quit steps done.");
    appendFileSync(this.LOG_FILE_PATH, `---------- End   : ${new Date().toISOString()} ----------\n\n`, "utf-8");
  }

  private registerIPCHandlers(): void {
    this.windowLogger.debug("Registering IPC API handlers.");
    this.registerIPCTLSBootstrapIPCHandlers();
    this.registerIPCTLSAPIIPCHandlers();
    this.registerUserAPIIPCHandlers();
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

  private registerUserAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering User API IPC handlers.");
    ipcMain.on(USER_API_IPC_CHANNELS.isUserAccountStorageOpen, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.isUserAccountStorageOpen}".`);
      event.returnValue = this.USER_API_HANDLERS.handleIsUserAccountStorageOpen();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.isUsernameAvailable, (event: IpcMainEvent, username: string): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.isUsernameAvailable}".`);
      event.returnValue = this.USER_API_HANDLERS.handleIsUsernameAvailable(username);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signUp, (event: IpcMainEvent, encryptedUserSignUpData: IEncryptedData<IUserSignUpDTO>): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signUp}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignUp(encryptedUserSignUpData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getUserCount, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getUserCount}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetUserCount();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getUsernameForUserId, (event: IpcMainEvent, userId: string): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getUsernameForUserId}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetUsernameForUserId(userId);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signIn, (event: IpcMainEvent, encryptedUserSignInData: IEncryptedData<IUserSignInDTO>): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signIn}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignIn(encryptedUserSignInData);
    });
    ipcMain.on(USER_API_IPC_CHANNELS.signOut, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.signOut}".`);
      event.returnValue = this.USER_API_HANDLERS.handleSignOut();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getSignedInUser, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getSignedInUser}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetSignedInUser();
    });
    ipcMain.on(
      USER_API_IPC_CHANNELS.addUserDataStorageConfig,
      (event: IpcMainEvent, encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>): void => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.addUserDataStorageConfig}".`);
        event.returnValue = this.USER_API_HANDLERS.handleAddUserDataStorageConfig(encryptedUserDataStorageConfigCreateDTO);
      }
    );
    ipcMain.on(
      USER_API_IPC_CHANNELS.addUserDataStorageVisibilityGroup,
      (event: IpcMainEvent, encryptedUserDataStorageVisibilityGroupCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupCreateDTO>): void => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.addUserDataStorageVisibilityGroup}".`);
        event.returnValue = this.USER_API_HANDLERS.handleAddUserDataStorageVisibilityGroup(encryptedUserDataStorageVisibilityGroupCreateDTO);
      }
    );
    ipcMain.on(
      USER_API_IPC_CHANNELS.openUserDataStorageVisibilityGroups,
      (
        event: IpcMainEvent,
        encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
      ): void => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.openUserDataStorageVisibilityGroups}".`);
        event.returnValue = this.USER_API_HANDLERS.handleOpenUserDataStorageVisibilityGroups(encryptedUserDataStorageVisibilityGroupsOpenRequestDTO);
      }
    );
    ipcMain.on(
      USER_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups,
      (event: IpcMainEvent, userDataStorageVisibilityGroupIds: string[]): void => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups}".`);
        event.returnValue = this.USER_API_HANDLERS.handleCloseUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupIds);
      }
    );
    ipcMain.on(USER_API_IPC_CHANNELS.getUserAccountStorageInfo, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getUserAccountStorageInfo}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetUserAccountStorageInfo();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getAllSignedInUserDataStoragesInfo, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(`Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getAllSignedInUserDataStoragesInfo}".`);
      event.returnValue = this.USER_API_HANDLERS.handleGetAllSignedInUserDataStoragesInfo();
    });
    ipcMain.on(USER_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo, (event: IpcMainEvent): void => {
      this.UserAPILogger.debug(
        `Received message from renderer on channel: "${USER_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo}".`
      );
      event.returnValue = this.USER_API_HANDLERS.handleGetAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
    });
  }

  private registerUtilsAPIIPCHandlers(): void {
    this.windowLogger.debug("Registering Utils API IPC handlers.");
    ipcMain.handle(
      UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker,
      async (_: IpcMainInvokeEvent, options: IGetDirectoryWithPickerOptions): Promise<IPCAPIResponse<IEncryptedData<string> | null>> => {
        this.UserAPILogger.debug(`Received message from renderer on channel: "${UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker}".`);
        return await this.UTILS_API_HANDLERS.handleGetDirectoryPathWithPicker(options);
      }
    );
  }
}
