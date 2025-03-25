import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  IUserAccountStorageAPI,
  USER_ACCOUNT_STORAGE_API_IPC_CHANNELS,
  UserAccountStorageAPIIPCChannel,
  UserAccountStorageChangedCallback,
  UserAccountStorageInfoChangedCallback
} from "@shared/IPC/APIs/UserAccountStorageAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE = "preload-ipc-user-account-storage-api";

export const USER_ACCOUNT_STORAGE_API_PRELOAD_HANDLERS: IUserAccountStorageAPI = {
  isUserAccountStorageOpen: (): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.isUserAccountStorageOpen;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<boolean>;
  },
  getUserCount: (): IPCAPIResponse<number> => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserCount;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<number>;
  },
  getUsernameForUserId: (userId: string): IPCAPIResponse<string | null> => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUsernameForUserId;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, userId) as IPCAPIResponse<string | null>;
  },
  getUserAccountStorageInfo: (): IPCAPIResponse<IUserAccountStorageInfo | null> => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.getUserAccountStorageInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IUserAccountStorageInfo | null>;
  },
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback): (() => void) => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, newUserAccountStorageInfo: IUserAccountStorageInfo | null): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(newUserAccountStorageInfo);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  onUserAccountStorageInfoChanged: (callback: UserAccountStorageInfoChangedCallback): (() => void) => {
    const CHANNEL: UserAccountStorageAPIIPCChannel = USER_ACCOUNT_STORAGE_API_IPC_CHANNELS.onUserAccountStorageInfoChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, newUserAccountStorageInfo: IUserAccountStorageInfo): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(newUserAccountStorageInfo);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_ACCOUNT_STORAGE_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
} as const;
