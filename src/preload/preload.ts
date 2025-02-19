import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { IPC_TLS_API_IPC_CHANNELS, USER_API_IPC_CHANNELS } from "@main/utils/IPC/IPCChannels";
import { CurrentlySignedInUserChangedCallback, IUserAPI, UserAccountStorageBackendAvailabilityChangedCallback } from "@shared/IPC/APIs/UserAPI";
import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";

// TODO: Investigate if information processing can be hidden in here
const IPC_TLS_API: IIPCTLSAPI = {
  getMainProcessPublicRSAKeyDER: (): IPCAPIResponse<ArrayBuffer> => {
    return ipcRenderer.sendSync(IPC_TLS_API_IPC_CHANNELS.getMainProcessPublicRSAKeyDER) as IPCAPIResponse<ArrayBuffer>;
  },
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer): Promise<IPCAPIResponse> => {
    return ipcRenderer.invoke(IPC_TLS_API_IPC_CHANNELS.sendRendererProcessWrappedAESKey, rendererProcessWrappedAESKey) as Promise<IPCAPIResponse>;
  }
} as const;

const USER_STORAGE_API: IUserAPI = {
  signUp: (encryptedUserSignUpData: EncryptedUserSignUpData): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signUp, encryptedUserSignUpData) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedUserSignInData: EncryptedUserSignInData): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signIn, encryptedUserSignInData) as IPCAPIResponse<boolean>;
  },
  signOut: (): IPCAPIResponse => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signOut) as IPCAPIResponse;
  },
  isAccountStorageBackendAvailable: (): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.isAccountStorageBackendAvailable) as IPCAPIResponse<boolean>;
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
  addUserDataStorageConfigToUser: (encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(
      USER_API_IPC_CHANNELS.addUserDataStorageConfigToUser,
      encryptedUserDataStorageConfigCreateDTO
    ) as IPCAPIResponse<boolean>;
  },
  onAccountStorageBackendAvailabilityChanged: (callback: UserAccountStorageBackendAvailabilityChangedCallback): (() => void) => {
    const CHANNEL: string = USER_API_IPC_CHANNELS.onAccountStorageBackendAvailabilityChanged;
    const LISTENER = (_: IpcRendererEvent, isUserAccountStorageBackendAvailable: boolean): void => {
      callback(isUserAccountStorageBackendAvailable);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  onCurrentlySignedInUserChanged: (callback: CurrentlySignedInUserChangedCallback): (() => void) => {
    const CHANNEL: string = USER_API_IPC_CHANNELS.onCurrentlySignedInUserChanged;
    const LISTENER = (_: IpcRendererEvent, newCurrentlySignedInUser: ICurrentlySignedInUser | null): void => {
      callback(newCurrentlySignedInUser);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
} as const;

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API);
contextBridge.exposeInMainWorld("userAPI", USER_STORAGE_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
