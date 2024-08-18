import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPCEncryptionIPCChannel, UserAccountManagerIPCChannel } from "../main/IPCChannels";
import { IUserAPI } from "../shared/IPC/APIs/IUserAPI";
import { INewUserRawData } from "../shared/user/accountSchemas";
import { IIPCEncryptionAPI } from "../shared/IPC/APIs/IIPCEncryptionAPI";

const IPC_ENCRYPTION_API: IIPCEncryptionAPI = {
  getPublicKey: (): string => {
    return ipcRenderer.sendSync(IPCEncryptionIPCChannel.getPublicKey) as string;
  }
};

const USER_STORAGE_API: IUserAPI = {
  isStorageAvailable: () => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isStorageAvailable) as boolean;
  },
  onStorageAvailabilityChange: (callback: (isAvailable: boolean) => void) => {
    ipcRenderer.on(UserAccountManagerIPCChannel.onStorageAvailabilityChange, (_: IpcRendererEvent, isAvailable: boolean) => {
      callback(isAvailable);
    });
  },
  isUsernameAvailable: (username: string) => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isUsernameAvailable, username) as boolean;
  },
  register: (userData: INewUserRawData) => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.register, userData) as boolean;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCEncryptionAPI", IPC_ENCRYPTION_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
