import { contextBridge, ipcRenderer } from "electron";
import { UserAccountManagerIPCChannel } from "../main/IPCChannels";
import { IUserAPI } from "../shared/IPC/APIs/types";

const USER_STORAGE_API: IUserAPI = {
  isStorageInitialised: () => {
    return ipcRenderer.invoke(UserAccountManagerIPCChannel.isStorageInitialised) as Promise<boolean>;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
