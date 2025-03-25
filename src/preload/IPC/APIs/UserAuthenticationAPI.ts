import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  IUserAuthenticationAPI,
  UserAuthenticationAPIIPCChannel,
  USER_AUTHENTICATION_API_IPC_CHANNELS,
  SignedInUserChangedCallback
} from "@shared/IPC/APIs/UserAuthenticationAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE = "preload-ipc-user-auth-api";

export const USER_AUTH_API_PRELOAD_HANDLERS: IUserAuthenticationAPI = {
  signUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.signUp;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserSignUpDTO) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.signIn;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserSignInDTO) as IPCAPIResponse<boolean>;
  },
  signOut: (): IPCAPIResponse<ISignedInUserInfo | null> => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.signOut;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<ISignedInUserInfo | null>;
  },
  isUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.isUsernameAvailable;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, username) as IPCAPIResponse<boolean>;
  },
  getSignedInUserInfo: (): IPCAPIResponse<ISignedInUserInfo | null> => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.getSignedInUserInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<ISignedInUserInfo | null>;
  },
  onSignedInUserChanged: (callback: SignedInUserChangedCallback): (() => void) => {
    const CHANNEL: UserAuthenticationAPIIPCChannel = USER_AUTHENTICATION_API_IPC_CHANNELS.onSignedInUserChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, newSignedInUserInfo: ISignedInUserInfo | null): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(newSignedInUserInfo);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_AUTH_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
} as const;
