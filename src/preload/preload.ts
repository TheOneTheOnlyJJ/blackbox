import { contextBridge, ipcRenderer } from "electron";
import type { UserStorageConfig } from "../shared/user/storage/types";
import { UserAccountManagerIPCChannel } from "../main/utils/IPCChannels";
import { IUserStorageAPI } from "../shared/IPC/APIs/types";

const USER_STORAGE_API: IUserStorageAPI = {
  getConfig: () => {
    return ipcRenderer.invoke(UserAccountManagerIPCChannel.getStorageConfig) as Promise<UserStorageConfig>;
  },
  initialise: () => {
    return ipcRenderer.invoke(UserAccountManagerIPCChannel.initialiseStorage) as Promise<boolean>;
  },
  close: () => {
    return ipcRenderer.invoke(UserAccountManagerIPCChannel.closeStorage) as Promise<boolean>;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("userStorageAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
