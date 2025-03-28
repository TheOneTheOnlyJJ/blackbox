import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import { IV_LENGTH } from "@shared/encryption/constants";
import { IIPCTLSAPI, IPCTLSAPIIPCChannel, IPC_TLS_API_IPC_CHANNELS, IPCTLSReadinessChangedCallback } from "@shared/IPC/APIs/IPCTLSAPI";
import { IIPCTLSBootstrapAPI, IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS } from "@shared/IPC/APIs/IPCTLSBootstrapAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const TEXT_ENCODER: TextEncoder = new TextEncoder();
const TEXT_DECODER: TextDecoder = new TextDecoder();

const PRELOAD_IPC_TLS_API_LOG_SCOPE = "p-ipc-tls-api";
const PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE = "p-ipc-tls-boot";

const RENDERER_IPC_TLS_READINESS_CHANGE_CALLBACKS: Map<string, IPCTLSReadinessChangedCallback> = new Map<string, IPCTLSReadinessChangedCallback>();
let isRendererIPCTLSReady = false;
const IPC_TLS_AES_KEY: { value: CryptoKey | null } = new Proxy<{ value: CryptoKey | null }>(
  { value: null },
  {
    set: (target: { value: CryptoKey | null }, property: string | symbol, value: unknown): boolean => {
      if (property !== "value") {
        throw new Error(`Cannot set property "${String(property)}" on IPC TLS AES key. Only "value" property can be set! No-op set.`);
      }
      if (value !== null && !(value instanceof CryptoKey)) {
        throw new Error(`Value must be null or a valid CryptoKey object! No-op set.`);
      }
      target[property] = value;
      isRendererIPCTLSReady = value !== null;
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Updated renderer IPC TLS readiness: ${isRendererIPCTLSReady.toString()}.`);
      RENDERER_IPC_TLS_READINESS_CHANGE_CALLBACKS.forEach((val: IPCTLSReadinessChangedCallback): void => {
        val(isRendererIPCTLSReady);
      });
      return true;
    }
  }
);

export const bootstrapIPCTLS = async (): Promise<void> => {
  sendLogToMainProcess(PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE, "info", "Bootstrapping IPC TLS.");
  const IPC_TLS_BOOTSTRAP_API_PRELOAD_HANDLERS: IIPCTLSBootstrapAPI = {
    generateAndGetMainProcessIPCTLSPublicRSAKeyDER: (): Promise<IPCAPIResponse<ArrayBuffer>> => {
      sendLogToMainProcess(
        PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE,
        "debug",
        `Messaging main on channel: "${IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.generateAndGetMainProcessIPCTLSPublicRSAKeyDER}".`
      );
      return ipcRenderer.invoke(IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.generateAndGetMainProcessIPCTLSPublicRSAKeyDER) as Promise<
        IPCAPIResponse<ArrayBuffer>
      >;
    },
    sendWrappedIPCTLSAESKey: (wrappedAESKey: IPCAPIResponse<ArrayBuffer>): void => {
      sendLogToMainProcess(
        PRELOAD_IPC_TLS_API_BOOTSTRAP_LOG_SCOPE,
        "debug",
        `Messaging main on channel: "${IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.sendWrappedIPCTLSAESKey}".`
      );
      ipcRenderer.send(IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS.sendWrappedIPCTLSAESKey, wrappedAESKey);
    }
  };
  // Get and import main process IPC TLS public RSA key, generate and wrap IPC TLS AES key
  try {
    const GENERATE_AND_GET_MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY_DER_RESPONSE: IPCAPIResponse<ArrayBuffer> =
      await IPC_TLS_BOOTSTRAP_API_PRELOAD_HANDLERS.generateAndGetMainProcessIPCTLSPublicRSAKeyDER();
    if (GENERATE_AND_GET_MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY_DER_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      throw new Error(GENERATE_AND_GET_MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY_DER_RESPONSE.error);
    }
    const MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY: CryptoKey = await crypto.subtle.importKey(
      "spki",
      GENERATE_AND_GET_MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY_DER_RESPONSE.data,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt", "wrapKey"]
    );
    IPC_TLS_AES_KEY.value = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const WRAPPED_IPC_TLS_AES_KEY: ArrayBuffer = await crypto.subtle.wrapKey("raw", IPC_TLS_AES_KEY.value, MAIN_PROCESS_IPC_TLS_PUBLIC_RSA_KEY, {
      name: "RSA-OAEP"
    });
    IPC_TLS_BOOTSTRAP_API_PRELOAD_HANDLERS.sendWrappedIPCTLSAESKey({ status: IPC_API_RESPONSE_STATUSES.SUCCESS, data: WRAPPED_IPC_TLS_AES_KEY });
  } catch (error: unknown) {
    IPC_TLS_AES_KEY.value = null;
    const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
    IPC_TLS_BOOTSTRAP_API_PRELOAD_HANDLERS.sendWrappedIPCTLSAESKey({
      status: IPC_API_RESPONSE_STATUSES.INTERNAL_ERROR,
      error: `IPC TLS bootstrap failed! Error: ${ERROR_MESSAGE}`
    });
  }
};

export const IPC_TLS_API_PRELOAD_HANDLERS: IIPCTLSAPI = {
  getMainReadiness: (): boolean => {
    const CHANNEL: IPCTLSAPIIPCChannel = IPC_TLS_API_IPC_CHANNELS.getMainReadiness;
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as boolean;
  },
  onMainReadinessChanged: (callback: IPCTLSReadinessChangedCallback): (() => void) => {
    const CHANNEL: IPCTLSAPIIPCChannel = IPC_TLS_API_IPC_CHANNELS.onMainReadinessChanged;
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (_: IpcRendererEvent, isMainIPCTLSReady: boolean): void => {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(isMainIPCTLSReady);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  },
  getRendererReadiness: (): boolean => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Getting renderer IPC TLS readiness: ${isRendererIPCTLSReady.toString()}.`);
    return isRendererIPCTLSReady;
  },
  onRendererReadinessChanged: (callback: IPCTLSReadinessChangedCallback): (() => void) => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", "Adding listener for renderer IPC TLS readiness.");
    // Generate random ID and ensure it is unique
    let callbackId: string = Math.random().toString();
    while (RENDERER_IPC_TLS_READINESS_CHANGE_CALLBACKS.has(callbackId)) {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "warn", "Prevented ID collision between listeners for renderer IPC TLS readiness.");
      callbackId = Math.random().toString();
    }
    RENDERER_IPC_TLS_READINESS_CHANGE_CALLBACKS.set(callbackId, callback);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", "Removing listener for renderer IPC TLS readiness.");
      RENDERER_IPC_TLS_READINESS_CHANGE_CALLBACKS.delete(callbackId);
    };
  },
  encrypt: async <T>(data: T, dataPurposeToLog?: string): Promise<IEncryptedData<T>> => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Encrypting ${dataPurposeToLog ?? "data"}.`);
    let dataString: string;
    if (typeof data === "string") {
      dataString = data;
    } else {
      dataString = JSON.stringify(data);
    }
    if (IPC_TLS_AES_KEY.value === null) {
      throw new Error("Missing AES key");
    }
    const IV: Uint8Array = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ENCRYPTED_DATA: IEncryptedData<T> = {
      data: new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: IV }, IPC_TLS_AES_KEY.value, TEXT_ENCODER.encode(dataString))),
      iv: IV
    };
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Done encrypting ${dataPurposeToLog ?? "data"}.`);
    return ENCRYPTED_DATA;
  },
  decryptAndValidateJSON: async <T>(
    encryptedData: IEncryptedData<T>,
    isValidData: (data: unknown) => data is T,
    dataPurposeToLog?: string
  ): Promise<T> => {
    sendLogToMainProcess(PRELOAD_IPC_TLS_API_LOG_SCOPE, "debug", `Decrypting ${dataPurposeToLog ?? "data"}.`);
    if (IPC_TLS_AES_KEY.value === null) {
      throw new Error("Missing AES key");
    }
    const DECRYPTED_DATA: ArrayBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: encryptedData.iv
      },
      IPC_TLS_AES_KEY.value,
      encryptedData.data
    );
    const DECRYPTED_DATA_STRING: string = TEXT_DECODER.decode(DECRYPTED_DATA);
    const DECRYPTED_DATA_OBJECT: unknown = JSON.parse(DECRYPTED_DATA_STRING);
    if (isValidData(DECRYPTED_DATA_OBJECT)) {
      return DECRYPTED_DATA_OBJECT satisfies T;
    } else {
      throw new Error("Decrypted object is not valid");
    }
  }
};

// TODO: Delete comment
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
