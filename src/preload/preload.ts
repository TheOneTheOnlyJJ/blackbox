import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPCEncryptionIPCChannel, UserAccountManagerIPCChannel } from "../main/utils/IPC/IPCChannels";
import { IUserAPI } from "../shared/IPC/APIs/IUserAPI";
import { IIPCEncryptionAPI } from "../shared/IPC/APIs/IIPCEncryptionAPI";
import { IEncryptedData } from "../shared/utils/IEncryptedData";

const IPC_ENCRYPTION_API: IIPCEncryptionAPI = {
  getMainProcessPublicRSAKeyDER: (): ArrayBuffer => {
    return ipcRenderer.sendSync(IPCEncryptionIPCChannel.getMainProcessPublicRSAKeyDER) as ArrayBuffer;
  },
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer): Promise<boolean> => {
    return ipcRenderer.invoke(IPCEncryptionIPCChannel.sendRendererProcessWrappedAESKey, rendererProcessWrappedAESKey) as Promise<boolean>;
  }
};

const USER_STORAGE_API: IUserAPI = {
  isStorageAvailable: (): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isStorageAvailable) as boolean;
  },
  onStorageAvailabilityChange: (callback: (isAvailable: boolean) => void): void => {
    ipcRenderer.on(UserAccountManagerIPCChannel.onStorageAvailabilityChange, (_: IpcRendererEvent, isAvailable: boolean) => {
      callback(isAvailable);
    });
  },
  isUsernameAvailable: (username: string): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isUsernameAvailable, username) as boolean;
  },
  register: (encryptedBaseNewUserData: IEncryptedData): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.register, encryptedBaseNewUserData) as boolean;
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCEncryptionAPI", IPC_ENCRYPTION_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
