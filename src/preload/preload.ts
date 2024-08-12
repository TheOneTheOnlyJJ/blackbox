import { contextBridge, ipcRenderer } from "electron";
import type { UserStorageConfig } from "../shared/user/storage/types";
import { IPCChannel } from "../main/utils/IPCUtils";
import { IUserStorageAPI } from "../shared/IPC/APIs/types";

const USER_STORAGE_API: IUserStorageAPI = {
  getDefaultConfig: () => {
    return ipcRenderer.invoke(IPCChannel.userStorageGetDefaultConfig) as Promise<UserStorageConfig>;
  },
  new: (config: UserStorageConfig) => {
    return ipcRenderer.invoke(IPCChannel.UserStorageNew, config) as Promise<boolean>;
  },
  close: () => {
    return ipcRenderer.invoke(IPCChannel.UserStorageClose) as Promise<boolean | null>;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("userStorageAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
