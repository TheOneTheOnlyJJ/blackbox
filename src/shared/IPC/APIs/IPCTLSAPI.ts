import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ValidateFunction } from "ajv";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";

// Utility types
export type IPCTLSReadinessChangedCallback = (isIPCTLSReady: boolean) => void;

// Only these functions require IPC communication with main process
export interface IIPCTLSAPIMain {
  getMainReadiness: () => boolean;
  onMainReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
}

export type IPCTLSAPIIPCChannels = TransformToIPCAPIChannels<"IPCTLS", IIPCTLSAPIMain>;
export type IPCTLSAPIIPCChannel = IPCTLSAPIIPCChannels[keyof IPCTLSAPIIPCChannels];

export const IPC_TLS_API_IPC_CHANNELS: IPCTLSAPIIPCChannels = {
  getMainReadiness: "IPCTLS:getMainReadiness",
  onMainReadinessChanged: "IPCTLS:onMainReadinessChanged"
} as const;

// Complete API
export interface IIPCTLSAPI extends IIPCTLSAPIMain {
  getRendererReadiness: () => boolean;
  onRendererReadinessChanged: (callback: IPCTLSReadinessChangedCallback) => () => void;
  encrypt: <T>(data: T, dataPurposeToLog?: string) => Promise<IEncryptedData<T>>;
  decryptAndValidateJSON: <T>(encryptedData: IEncryptedData<T>, JSONValidator: ValidateFunction<T>, dataPurposeToLog?: string) => Promise<T>;
}
