import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ValidateFunction } from "ajv";

// Utility types
export type IPCTLSReadinessChangedCallback = (isIPCTLSReady: boolean) => void;

// Only these functions require IPC communication with main process
export interface IIPCTLSAPIMain {
  getMainReadiness: () => boolean;
  onMainReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
}

export const IPC_TLS_API_IPC_CHANNELS = {
  getMainReadiness: "IPCTLSAPI:getMainReadiness",
  onMainReadinessChanged: "IPCTLSAPI:onMainReadinessChanged"
} as const;
export type IPCTLSAPIIPCChannels = typeof IPC_TLS_API_IPC_CHANNELS;
export type IPCTLSAPIIPCChannel = IPCTLSAPIIPCChannels[keyof IPCTLSAPIIPCChannels];

// Complete API
export interface IIPCTLSAPI extends IIPCTLSAPIMain {
  getRendererReadiness: () => boolean;
  onRendererReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
  encrypt: <T>(data: T, dataPurposeToLog?: string) => Promise<IEncryptedData<T>>;
  decryptAndValidateJSON: <T>(encryptedData: IEncryptedData<T>, JSONValidator: ValidateFunction<T>, dataPurposeToLog?: string) => Promise<T>;
}
