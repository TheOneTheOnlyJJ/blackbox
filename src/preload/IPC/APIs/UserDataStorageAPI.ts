import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  InitialisedUserDataStorageInfoChangedCallback,
  InitialisedUserDataStoragesChangedCallback,
  IUserDataStorageAPI,
  USER_DATA_STORAGE_API_IPC_CHANNELS,
  UserDataStorageAPIIPCChannel
} from "@shared/IPC/APIs/UserDataStorageAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE = "p-ipc-udata-strg-api";

export const USER_DATA_STORAGE_API_PRELOAD_HANDLERS: IUserDataStorageAPI = {
  initialiseUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.initialiseUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, storageId) as IPCAPIResponse<IEncryptedData<boolean>>;
  },
  terminateUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.terminateUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, storageId) as IPCAPIResponse<IEncryptedData<boolean>>;
  },
  openUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.openUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, storageId) as IPCAPIResponse<IEncryptedData<boolean>>;
  },
  closeUserDataStorage: (storageId: string): IPCAPIResponse<IEncryptedData<boolean>> => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.closeUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, storageId) as IPCAPIResponse<IEncryptedData<boolean>>;
  },
  getAllSignedInUserInitialisedDataStoragesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>> => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.getAllSignedInUserInitialisedDataStoragesInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>>;
  },
  onInitialisedUserDataStoragesChanged: (callback: InitialisedUserDataStoragesChangedCallback): (() => void) => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.onInitialisedUserDataStoragesChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedInitialisedUserDataStoragesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageInfo>>
    ): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedInitialisedUserDataStoragesInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  onInitialisedUserDataStorageInfoChanged: (callback: InitialisedUserDataStorageInfoChangedCallback): (() => void) => {
    const CHANNEL: UserDataStorageAPIIPCChannel = USER_DATA_STORAGE_API_IPC_CHANNELS.onInitialisedUserDataStorageInfoChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, encryptedNewUserDataStorageInfo: IEncryptedData<IUserDataStorageInfo>): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedNewUserDataStorageInfo);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
};
