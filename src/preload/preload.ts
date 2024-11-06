import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC_TLS_API_IPC_CHANNELS, USER_API_IPC_CHANNELS } from "@main/utils/IPC/IPCChannels";
import { CurrentlySignedInUserChangeCallback, IUserAPI, UserAccountStorageAvailabilityChangeCallback } from "@shared/IPC/APIs/UserAPI";
import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { ICurrentlySignedInUser } from "@shared/user/CurrentlySignedInUser";
import { IEncryptedUserSignInCredentials } from "@shared/user/encrypted/EncryptedUserSignInCredentials";
import { IEncryptedBaseNewUserData } from "@shared/user/encrypted/EncryptedBaseNewUserData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";

const IPC_TLS_API: IIPCTLSAPI = {
  getMainProcessPublicRSAKeyDER: (): IPCAPIResponse<ArrayBuffer> => {
    return ipcRenderer.sendSync(IPC_TLS_API_IPC_CHANNELS.getMainProcessPublicRSAKeyDER) as IPCAPIResponse<ArrayBuffer>;
  },
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer): Promise<IPCAPIResponse> => {
    return ipcRenderer.invoke(IPC_TLS_API_IPC_CHANNELS.sendRendererProcessWrappedAESKey, rendererProcessWrappedAESKey) as Promise<IPCAPIResponse>;
  }
};

const USER_STORAGE_API: IUserAPI = {
  signUp: (encryptedBaseNewUserData: IEncryptedBaseNewUserData): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signUp, encryptedBaseNewUserData) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedSignInCredentials: IEncryptedUserSignInCredentials): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signIn, encryptedSignInCredentials) as IPCAPIResponse<boolean>;
  },
  signOut: (): IPCAPIResponse => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signOut) as IPCAPIResponse;
  },
  isAccountStorageAvailable: (): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.isAccountStorageAvailable) as IPCAPIResponse<boolean>;
  },
  isUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.isUsernameAvailable, username) as IPCAPIResponse<boolean>;
  },
  getUserCount: (): IPCAPIResponse<number> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.getUserCount) as IPCAPIResponse<number>;
  },
  getCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.getCurrentlySignedInUser) as IPCAPIResponse<ICurrentlySignedInUser | null>;
  },
  onAccountStorageAvailabilityChange: (callback: UserAccountStorageAvailabilityChangeCallback): (() => void) => {
    const LISTENER = (_: IpcRendererEvent, isAvailable: boolean): void => {
      callback(isAvailable);
    };
    ipcRenderer.on(USER_API_IPC_CHANNELS.onAccountStorageAvailabilityChange, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(USER_API_IPC_CHANNELS.onAccountStorageAvailabilityChange, LISTENER);
    };
  },
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback): (() => void) => {
    const LISTENER = (_: IpcRendererEvent, newSignedInUser: ICurrentlySignedInUser | null): void => {
      callback(newSignedInUser);
    };
    ipcRenderer.on(USER_API_IPC_CHANNELS.onCurrentlySignedInUserChange, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(USER_API_IPC_CHANNELS.onCurrentlySignedInUserChange, LISTENER);
    };
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
