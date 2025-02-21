import { IEncryptedData } from "@shared/utils/EncryptedData";

export type TLSReadinessChangedCallback = (isTLSReady: boolean) => void;

// Only these functions require IPC communication with main process
export interface IIPCTLSAPIMain {
  isMainReady: () => boolean;
  onMainReadinessChanged: (callback: TLSReadinessChangedCallback) => () => void;
}

export const IPC_TLS_API_CHANNELS = {
  isMainReady: "IPCTLSAPI:isMainReady",
  onMainReadinessChanged: "IPCTLSAPI:onMainReadinessChanged"
} as const;
export type IPCTLSAPIChannels = typeof IPC_TLS_API_CHANNELS;
export type IPCTLSAPIChannel = IPCTLSAPIChannels[keyof IPCTLSAPIChannels];

// Complete API
export interface IIPCTLSAPI extends IIPCTLSAPIMain {
  isRendererReady: () => boolean;
  onRendererReadinessChanged: (callback: TLSReadinessChangedCallback) => () => void;
  encryptData: (data: string, dataPurposeToLog?: string) => Promise<IEncryptedData>;
}
