import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import {
  CurrentlySignedInUserChangedCallback,
  IUserAPI,
  USER_API_IPC_CHANNELS,
  UserAccountStorageBackendAvailabilityChangedCallback,
  UserAPIIPCChannel
} from "@shared/IPC/APIs/UserAPI";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import { IIPCTLSAPI, IPC_TLS_API_CHANNELS, IPCTLSAPIChannel, TLSReadinessChangedCallback } from "@shared/IPC/APIs/IPCTLSAPI";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IIPCTLSBootstrapAPI, IIPCTLSBootstrapProgress, IPC_TLS_BOOTSTRAP_API_CHANNELS } from "@shared/IPC/APIs/IPCTLSBootstrapAPI";
import { LogLevel, LogMessage } from "electron-log";

// Variables
const TEXT_ENCODER: TextEncoder = new TextEncoder();
const PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE = "preload-ipc-tls-bootstrap";
const PRELOAD_IPC_TLS_API_LOG_SCOPE = "preload-ipc-tls-api";
const PRELOAD_IPC_USER_API_LOG_SCOPE = "preload-ipc-user-api";

// Functions
const sendLogToMainProcess = (scope: string, level: LogLevel, message: string): void => {
  ipcRenderer.send("__ELECTRON_LOG__", {
    date: new Date(),
    scope: scope,
    level: level,
    data: [message],
    variables: { processType: "renderer" }
  } satisfies LogMessage);
};

const RENDERER_TLS_READINESS_CHANGE_CALLBACKS: Map<string, TLSReadinessChangedCallback> = new Map<string, TLSReadinessChangedCallback>();
let isRendererTLSReady = false;
const IPC_TLS_AES_KEY: { value: CryptoKey | null } = new Proxy<{ value: CryptoKey | null }>(
  { value: null },
  {
    set: (target: { value: CryptoKey | null }, property: string | symbol, value: unknown): boolean => {
      if (property !== "value") {
        throw new Error(`Cannot set property "${String(property)}" on IPC TLS AES key. Only "value" property can be set! No-op set.`);
      }
      if (value !== null && !(value instanceof CryptoKey)) {
        throw new Error(`Value must be "null" or a valid CryptoKey object! No-op set.`);
      }
      target[property] = value;
      isRendererTLSReady = value !== null;
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Updated renderer IPC TLS readiness: "${isRendererTLSReady.toString()}".`);
      RENDERER_TLS_READINESS_CHANGE_CALLBACKS.forEach((val: TLSReadinessChangedCallback): void => {
        val(isRendererTLSReady);
      });
      return true;
    }
  }
);

// This cannot use await because preload does not support top-level awaits
const bootstrapIPCTLS = (): void => {
  const IPC_TLS_BOOTSTRAP_API: IIPCTLSBootstrapAPI = {
    getPublicRSAKeyDER: (): ArrayBuffer => {
      sendLogToMainProcess(
        PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE,
        "debug",
        `Messaging main on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.getPublicRSAKeyDER}".`
      );
      return ipcRenderer.sendSync(IPC_TLS_BOOTSTRAP_API_CHANNELS.getPublicRSAKeyDER) as ArrayBuffer;
    },
    sendProgress: (progress: IIPCTLSBootstrapProgress): void => {
      sendLogToMainProcess(
        PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE,
        "debug",
        `Messaging main on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.sendProgress}".`
      );
      ipcRenderer.send(IPC_TLS_BOOTSTRAP_API_CHANNELS.sendProgress, progress);
    },
    sendWrappedAESKey: (wrappedAESKey: ArrayBuffer): void => {
      sendLogToMainProcess(
        PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE,
        "debug",
        `Messaging main on channel: "${IPC_TLS_BOOTSTRAP_API_CHANNELS.sendWrappedAESKey}".`
      );
      ipcRenderer.send(IPC_TLS_BOOTSTRAP_API_CHANNELS.sendWrappedAESKey, wrappedAESKey);
    }
  };
  // Get main process public RSA key
  let mainProcessPublicRSAKeyImportProgress: IIPCTLSBootstrapProgress;
  sendLogToMainProcess(PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE, "debug", `Initialising IPC TLS.`);
  const MAIN_PROCESS_PUBLIC_RSA_KEY_DER_ARRAY_BUFFER = IPC_TLS_BOOTSTRAP_API.getPublicRSAKeyDER();
  // Import the main process public RSA key in the WebCryptoAPI CryptoKey format
  crypto.subtle
    .importKey("spki", MAIN_PROCESS_PUBLIC_RSA_KEY_DER_ARRAY_BUFFER, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt", "wrapKey"])
    .then(
      (mainProcessPublicRSAKey: CryptoKey): void => {
        mainProcessPublicRSAKeyImportProgress = { wasSuccessful: true, message: "Main process public RSA key imported successfully" };
        let IPCTLSAESKeyGenerationProgress: IIPCTLSBootstrapProgress;
        // Generate IPC TLS AES key
        crypto.subtle
          .generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
          .then(
            (AESKey: CryptoKey): void => {
              IPC_TLS_AES_KEY.value = AESKey;
              IPCTLSAESKeyGenerationProgress = { wasSuccessful: true, message: "IPC TLS AES key generated successfully" };
              let IPCTLSAESKeyWrappingProgress: IIPCTLSBootstrapProgress;
              let didSendWrappingProgress = false;
              // Wrap the generated IPC TLS AES key with the main process' public RSA key
              crypto.subtle
                .wrapKey("raw", IPC_TLS_AES_KEY.value, mainProcessPublicRSAKey, { name: "RSA-OAEP" })
                .then(
                  (wrappedIPCTLSAESKey: ArrayBuffer): void => {
                    IPCTLSAESKeyWrappingProgress = { wasSuccessful: true, message: "IPC TLS AES key wrapped successfully" };
                    IPC_TLS_BOOTSTRAP_API.sendProgress(IPCTLSAESKeyWrappingProgress);
                    didSendWrappingProgress = true;
                    // Send wrapped key to main process
                    IPC_TLS_BOOTSTRAP_API.sendWrappedAESKey(wrappedIPCTLSAESKey);
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
                    IPC_TLS_BOOTSTRAP_API.sendProgress(IPCTLSAESKeyWrappingProgress);
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
            IPC_TLS_BOOTSTRAP_API.sendProgress(IPCTLSAESKeyGenerationProgress);
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
      IPC_TLS_BOOTSTRAP_API.sendProgress(mainProcessPublicRSAKeyImportProgress);
    });
};

bootstrapIPCTLS();

// TODO: Remove this
// TEST
// let latestVal: CryptoKey | null = null;
// setInterval(() => {
//   if (latestVal === null) {
//     latestVal = IPC_TLS_AES_KEY.value;
//     IPC_TLS_AES_KEY.value = null;
//   } else {
//     IPC_TLS_AES_KEY.value = latestVal;
//     latestVal = null;
//   }
// }, 5_000);

const IPC_TLS_API: IIPCTLSAPI = {
  isMainReady: (): boolean => {
    const CHANNEL: IPCTLSAPIChannel = IPC_TLS_API_CHANNELS.isMainReady;
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as boolean;
  },
  onMainReadinessChanged: (callback: TLSReadinessChangedCallback): (() => void) => {
    const CHANNEL: IPCTLSAPIChannel = IPC_TLS_API_CHANNELS.onMainReadinessChanged;
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, isMainTLSReady: boolean): void => {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(isMainTLSReady);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  isRendererReady: (): boolean => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Getting renderer IPC TLS readiness: "${isRendererTLSReady.toString()}".`);
    return isRendererTLSReady;
  },
  onRendererReadinessChanged: (callback: TLSReadinessChangedCallback): (() => void) => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", "Adding listener for renderer IPC TLS readiness.");
    // Generate random ID and ensure it is unique
    let callbackId: string = Math.random().toString();
    while (RENDERER_TLS_READINESS_CHANGE_CALLBACKS.has(callbackId)) {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "warn", "Prevented ID collision between listeners for renderer IPC TLS readiness.");
      callbackId = Math.random().toString();
    }
    RENDERER_TLS_READINESS_CHANGE_CALLBACKS.set(callbackId, callback);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", "Removing listener for renderer IPC TLS readiness.");
      RENDERER_TLS_READINESS_CHANGE_CALLBACKS.delete(callbackId);
    };
  },
  encryptData: async (data: string, dataPurposeToLog?: string): Promise<IEncryptedData> => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Encrypting ${dataPurposeToLog ?? "data"}.`);
    if (IPC_TLS_AES_KEY.value === null) {
      throw new Error("Missing AES key");
    }
    const IV: Uint8Array = crypto.getRandomValues(new Uint8Array(12));
    const ENCRYPTED_DATA: IEncryptedData = {
      data: await crypto.subtle.encrypt({ name: "AES-GCM", iv: IV }, IPC_TLS_AES_KEY.value, TEXT_ENCODER.encode(data)),
      iv: IV
    };
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Done encrypting ${dataPurposeToLog ?? "data"}.`);
    return ENCRYPTED_DATA;
  }
};

const USER_API: IUserAPI = {
  signUp: (encryptedUserSignUpData: EncryptedUserSignUpData): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.signUp;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserSignUpData) as IPCAPIResponse<boolean>;
  },
  signIn: (encryptedUserSignInData: EncryptedUserSignInData): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.signIn;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserSignInData) as IPCAPIResponse<boolean>;
  },
  signOut: (): IPCAPIResponse => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.signOut;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse;
  },
  isAccountStorageBackendAvailable: (): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.isAccountStorageBackendAvailable;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<boolean>;
  },
  isUsernameAvailable: (username: string): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.isUsernameAvailable;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, username) as IPCAPIResponse<boolean>;
  },
  getUserCount: (): IPCAPIResponse<number> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.getUserCount;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<number>;
  },
  getCurrentlySignedInUser: (): IPCAPIResponse<ICurrentlySignedInUser | null> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.getCurrentlySignedInUser;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<ICurrentlySignedInUser | null>;
  },
  addUserDataStorageConfigToUser: (encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO): IPCAPIResponse<boolean> => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.addUserDataStorageConfigToUser;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataStorageConfigCreateDTO) as IPCAPIResponse<boolean>;
  },
  onAccountStorageBackendAvailabilityChanged: (callback: UserAccountStorageBackendAvailabilityChangedCallback): (() => void) => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onAccountStorageBackendAvailabilityChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, isUserAccountStorageBackendAvailable: boolean): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(isUserAccountStorageBackendAvailable);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  onCurrentlySignedInUserChanged: (callback: CurrentlySignedInUserChangedCallback): (() => void) => {
    const CHANNEL: UserAPIIPCChannel = USER_API_IPC_CHANNELS.onCurrentlySignedInUserChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, newCurrentlySignedInUser: ICurrentlySignedInUser | null): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(newCurrentlySignedInUser);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
} as const;

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API);
contextBridge.exposeInMainWorld("userAPI", USER_API);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
