import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  IUserDataStorageConfigAPI,
  UserDataStorageConfigAPIIPCChannel,
  USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS,
  AvailableUserDataStorageConfigsChangedCallback
} from "@shared/IPC/APIs/UserDataStorageConfigAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE = "p-ipc-udata-strg-cfg-api";

export const USER_DATA_STORAGE_CONFIG_API_PRELOAD_HANDLERS: IUserDataStorageConfigAPI = {
  addUserDataStorageConfig: (encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.addUserDataStorageConfig;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataStorageConfigCreateDTO) as IPCAPIResponse<boolean>;
  },
  getAllSignedInUserAvailableDataStorageConfigsInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>> => {
    const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.getAllSignedInUserAvailableDataStorageConfigsInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>>;
  },
  onAvailableUserDataStorageConfigsChanged: (callback: AvailableUserDataStorageConfigsChangedCallback): (() => void) => {
    const CHANNEL: UserDataStorageConfigAPIIPCChannel = USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS.onAvailableUserDataStorageConfigsChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedUserDataStorageConfigsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageConfigInfo>>
    ): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedUserDataStorageConfigsInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_CONFIG_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
} as const;
