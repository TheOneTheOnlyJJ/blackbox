import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { UserAccountManagerIPCChannel } from "../main/IPCChannels";
import { IUserAPI } from "../shared/IPC/APIs/types";

const USER_STORAGE_API: IUserAPI = {
  isStorageAvailable: () => {
    return ipcRenderer.invoke(UserAccountManagerIPCChannel.isStorageAvailable) as Promise<boolean>;
  },
  onStorageAvailabilityChanged: (callback: (isAvailable: boolean) => void) => {
    ipcRenderer.on(UserAccountManagerIPCChannel.onStorageAvailabilityChanged, (_: IpcRendererEvent, isAvailable: boolean) => {
      callback(isAvailable);
    });
  },
  isUsernameAvailable: (username: string) => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isUsernameAvailable, username) as boolean;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
