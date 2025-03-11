import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ValidateFunction } from "ajv";

export type IPCTLSReadinessChangedCallback = (isIPCTLSReady: boolean) => void;

// Only these functions require IPC communication with main process
export interface IIPCTLSAPIMain {
  getMainReadiness: () => boolean;
  onMainReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
}

export const IPC_TLS_API_CHANNELS = {
  getMainReadiness: "IPCTLSAPI:getMainReadiness",
  onMainReadinessChanged: "IPCTLSAPI:onMainReadinessChanged"
} as const;
export type IPCTLSAPIChannels = typeof IPC_TLS_API_CHANNELS;
export type IPCTLSAPIChannel = IPCTLSAPIChannels[keyof IPCTLSAPIChannels];

// Complete API
export interface IIPCTLSAPI extends IIPCTLSAPIMain {
  getRendererReadiness: () => boolean;
  onRendererReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
  encrypt: <T>(data: T, dataPurposeToLog?: string) => Promise<IEncryptedData<T>>;
  decryptAndValidateJSON: <T>(encryptedData: IEncryptedData<T>, JSONValidator: ValidateFunction<T>, dataPurposeToLog?: string) => Promise<T>;
}
