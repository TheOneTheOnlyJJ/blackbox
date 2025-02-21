import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import {
  CurrentlySignedInUserChangedCallback,
  IUserAPI,
  USER_API_IPC_CHANNELS,
  UserAccountStorageBackendAvailabilityChangedCallback
} from "@shared/IPC/APIs/UserAPI";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IIPCTLSInitialisationProgress, IPC_TLS_INITIALISATION_CHANNELS } from "@shared/IPC/IPCTLSInitialisation";
import { LogLevel, LogMessage } from "electron-log";

const TEXT_ENCODER: TextEncoder = new TextEncoder();
const IPC_TLS_API_LOG_SCOPE = "renderer-ipc-tls-api";
let IPCTLSAESKey: CryptoKey | null = null;

let mainProcessPublicRSAKeyImportProgress: IIPCTLSInitialisationProgress;
// Import the main process public RSA key in the WebCryptoAPI CryptoKey format
const MAIN_PROCESS_PUBLIC_RSA_KEY_DER_ARRAY_BUFFER = ipcRenderer.sendSync(
  IPC_TLS_INITIALISATION_CHANNELS.getMainProcessPublicRSAKeyDER
) as ArrayBuffer;
crypto.subtle
  .importKey("spki", MAIN_PROCESS_PUBLIC_RSA_KEY_DER_ARRAY_BUFFER, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt", "wrapKey"])
  .then(
    (mainProcessPublicRSAKey: CryptoKey): void => {
      mainProcessPublicRSAKeyImportProgress = { wasSuccessful: true, message: "Main process public RSA key imported successfully" };
      let IPCTLSAESKeyGenerationProgress: IIPCTLSInitialisationProgress;
      // Generate IPC TLS AES key
      crypto.subtle
        .generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
        .then(
          (AESKey: CryptoKey): void => {
            IPCTLSAESKey = AESKey;
            IPCTLSAESKeyGenerationProgress = { wasSuccessful: true, message: "IPC TLS AES key generated successfully" };
            let IPCTLSAESKeyWrappingProgress: IIPCTLSInitialisationProgress;
            let didSendWrappingProgress = false;
            // Wrap the generated IPC TLS AES key with the main process' public RSA key
            crypto.subtle
              .wrapKey("raw", IPCTLSAESKey, mainProcessPublicRSAKey, { name: "RSA-OAEP" })
              .then(
                (wrappedIPCTLSAESKey: ArrayBuffer): void => {
                  IPCTLSAESKeyWrappingProgress = { wasSuccessful: true, message: "IPC TLS AES key wrapped successfully" };
                  ipcRenderer.send(IPC_TLS_INITIALISATION_CHANNELS.IPCTLSInitialisationProgress, IPCTLSAESKeyWrappingProgress);
                  didSendWrappingProgress = true;
                  // Send wrapped key to main process
                  ipcRenderer.send(IPC_TLS_INITIALISATION_CHANNELS.sendWrappedIPCTLSAESKeyToMain, wrappedIPCTLSAESKey);
                },
                (reason: unknown): void => {
                  const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                  IPCTLSAESKeyWrappingProgress = { wasSuccessful: false, message: REASON_MESSAGE };
                }
              )
              .catch((reason: unknown): void => {
                const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
                IPCTLSAESKeyWrappingProgress = { wasSuccessful: false, message: REASON_MESSAGE };
              })
              .finally((): void => {
                if (!didSendWrappingProgress) {
                  ipcRenderer.send(IPC_TLS_INITIALISATION_CHANNELS.IPCTLSInitialisationProgress, IPCTLSAESKeyWrappingProgress);
                }
              });
          },
          (reason: unknown): void => {
            const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
            IPCTLSAESKeyGenerationProgress = { wasSuccessful: false, message: REASON_MESSAGE };
          }
        )
        .catch((reason: unknown): void => {
          const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
          IPCTLSAESKeyGenerationProgress = { wasSuccessful: false, message: REASON_MESSAGE };
        })
        .finally((): void => {
          ipcRenderer.send(IPC_TLS_INITIALISATION_CHANNELS.IPCTLSInitialisationProgress, IPCTLSAESKeyGenerationProgress);
        });
    },
    (reason: unknown): void => {
      const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
      mainProcessPublicRSAKeyImportProgress = { wasSuccessful: false, message: REASON_MESSAGE };
    }
  )
  .catch((reason: unknown): void => {
    const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
    mainProcessPublicRSAKeyImportProgress = { wasSuccessful: false, message: REASON_MESSAGE };
  })
  .finally((): void => {
    ipcRenderer.send(IPC_TLS_INITIALISATION_CHANNELS.IPCTLSInitialisationProgress, mainProcessPublicRSAKeyImportProgress);
  });

const sendLogToMainProcess = (scope: string, level: LogLevel, message: string): void => {
  ipcRenderer.send("__ELECTRON_LOG__", {
    date: new Date(),
    scope: scope,
    level: level,
    data: [message],
    variables: { processType: "renderer" }
  } satisfies LogMessage);
};

const IPC_TLS_API: IIPCTLSAPI = {
  isAESKeyReady: (): boolean => {
    return IPCTLSAESKey !== null;
  },
  encryptData: async (data: string, dataPurposeToLog?: string): Promise<IEncryptedData> => {
    sendLogToMainProcess(IPC_TLS_API_LOG_SCOPE, "debug", `Encrypting ${dataPurposeToLog ?? "data"}.`);
    if (IPCTLSAESKey === null) {
      throw new Error("Missing AES key");
    }
    const IV: Uint8Array = crypto.getRandomValues(new Uint8Array(12));
    const ENCRYPTED_DATA: IEncryptedData = {
      data: await crypto.subtle.encrypt({ name: "AES-GCM", iv: IV }, IPCTLSAESKey, TEXT_ENCODER.encode(data)),
      iv: IV
    };
    sendLogToMainProcess(IPC_TLS_API_LOG_SCOPE, "debug", `Done encrypting ${dataPurposeToLog ?? "data"}.`);
    return ENCRYPTED_DATA;
  }
};

const USER_API: IUserAPI = {
  signUp: (encryptedUserSignUpData: EncryptedUserSignUpData): IPCAPIResponse<boolean> => {
    return ipcRenderer.sendSync(USER_API_IPC_CHANNELS.signUp, encryptedUserSignUpData) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedUserSignInData: EncryptedUserSignInData): IPCAPIResponse<boolean> => {
    // TODO: Wrap entire API with this. Also on main
    // const CHANNEL = USER_API_IPC_CHANNELS.signIn;
    // sendLogToMainProcess("renderer-user-api", "debug", `Sending IPC message to main over channel ${CHANNEL}.`);
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
contextBridge.exposeInMainWorld("userAPI", USER_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
