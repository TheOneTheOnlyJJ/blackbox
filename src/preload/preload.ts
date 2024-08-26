import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPCEncryptionIPCChannel, UserAccountManagerIPCChannel } from "../main/utils/IPC/IPCChannels";
import { CurrentlyLoggedInUserChangeCallback, IUserAPI, UserStorageAvailabilityChangeCallback } from "../shared/IPC/APIs/IUserAPI";
import { IIPCEncryptionAPI } from "../shared/IPC/APIs/IIPCEncryptionAPI";
import { ICurrentlyLoggedInUser } from "../shared/user/ICurrentlyLoggedInUser";
import { IEncryptedUserLoginCredentials } from "../shared/user/IEncryptedUserLoginCredentials";
import { IEncryptedBaseNewUserData } from "../shared/user/IEncryptedBaseNewUserData";

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
  onUserStorageAvailabilityChange: (callback: UserStorageAvailabilityChangeCallback): void => {
    ipcRenderer.on(UserAccountManagerIPCChannel.onUserStorageAvailabilityChange, (_: IpcRendererEvent, isAvailable: boolean) => {
      callback(isAvailable);
    });
  },
  isUsernameAvailable: (username: string): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.isUsernameAvailable, username) as boolean;
  },
  register: (encryptedBaseNewUserData: IEncryptedBaseNewUserData): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.register, encryptedBaseNewUserData) as boolean;
  },
  getUserCount: (): number => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.getUserCount) as number;
  },
  login: (encryptedLoginCredentials: IEncryptedUserLoginCredentials): boolean => {
    return ipcRenderer.sendSync(UserAccountManagerIPCChannel.login, encryptedLoginCredentials) as boolean;
  },
  onCurrentlyLoggedInUserChange: (callback: CurrentlyLoggedInUserChangeCallback): void => {
    ipcRenderer.on(
      UserAccountManagerIPCChannel.onCurrentlyLoggedInUserChange,
      (_: IpcRendererEvent, newLoggedInUser: ICurrentlyLoggedInUser | null) => {
        callback(newLoggedInUser);
      }
    );
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCEncryptionAPI", IPC_ENCRYPTION_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
