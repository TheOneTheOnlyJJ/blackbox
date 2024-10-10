import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPCTLSAPIIPCChannel, UserAPIIPCChannel } from "../main/utils/IPC/IPCChannels";
import { CurrentlySignedInUserChangeCallback, IUserAPI, UserAccountStorageAvailabilityChangeCallback } from "../shared/IPC/APIs/IUserAPI";
import { IIPCTLSAPI } from "../shared/IPC/APIs/IIPCTLSAPI";
import { ICurrentlySignedInUser } from "../shared/user/ICurrentlySignedInUser";
import { IEncryptedUserSignInCredentials } from "../shared/user/encrypted/IEncryptedUserSignInCredentials";
import { IEncryptedBaseNewUserData } from "../shared/user/encrypted/IEncryptedBaseNewUserData";
import { IPCAPIResponse } from "../shared/IPC/IPCAPIResponse";

const IPC_TLS_API: IIPCTLSAPI = {
  getMainProcessPublicRSAKeyDER: (): IPCAPIResponse<ArrayBuffer> => {
    return ipcRenderer.sendSync(IPCTLSAPIIPCChannel.getMainProcessPublicRSAKeyDER) as IPCAPIResponse<ArrayBuffer>;
  },
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer): Promise<IPCAPIResponse> => {
    return ipcRenderer.invoke(IPCTLSAPIIPCChannel.sendRendererProcessWrappedAESKey, rendererProcessWrappedAESKey) as Promise<IPCAPIResponse>;
  }
};

const USER_STORAGE_API: IUserAPI = {
  signUp: (encryptedBaseNewUserData: IEncryptedBaseNewUserData): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.signUp, encryptedBaseNewUserData) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedSignInCredentials: IEncryptedUserSignInCredentials): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.signIn, encryptedSignInCredentials) as IPCAPIResponse<boolean>;
  },
  signOut: (): IPCAPIResponse => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.signOut) as IPCAPIResponse;
  },
  isAccountStorageAvailable: (): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.isAccountStorageAvailable) as IPCAPIResponse<boolean>;
  },
  isUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.isUsernameAvailable, username) as IPCAPIResponse<boolean>;
  },
  getUserCount: (): IPCAPIResponse<number> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.getUserCount) as IPCAPIResponse<number>;
  },
  getCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
    return ipcRenderer.sendSync(UserAPIIPCChannel.getCurrentlySignedInUser) as IPCAPIResponse<ICurrentlySignedInUser | null>;
  },
  onAccountStorageAvailabilityChange: (callback: UserAccountStorageAvailabilityChangeCallback): (() => void) => {
    const LISTENER = (_: IpcRendererEvent, isAvailable: boolean): void => {
      callback(isAvailable);
    };
    ipcRenderer.on(UserAPIIPCChannel.onAccountStorageAvailabilityChange, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(UserAPIIPCChannel.onAccountStorageAvailabilityChange, LISTENER);
    };
  },
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback): (() => void) => {
    const LISTENER = (_: IpcRendererEvent, newSignedInUser: ICurrentlySignedInUser | null): void => {
      callback(newSignedInUser);
    };
    ipcRenderer.on(UserAPIIPCChannel.onCurrentlySignedInUserChange, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(UserAPIIPCChannel.onCurrentlySignedInUserChange, LISTENER);
    };
  }
};

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
