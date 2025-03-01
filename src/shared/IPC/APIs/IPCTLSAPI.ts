import { IEncryptedData } from "@shared/utils/EncryptedData";

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
  encryptData: (data: string, dataPurposeToLog?: string) => Promise<IEncryptedData>;
  // TODO: Add decrypt data function
}
