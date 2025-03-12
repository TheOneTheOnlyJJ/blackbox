import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IIPCTLSBootstrapAPI {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: () => Promise<IPCAPIResponse<ArrayBuffer>>;
  sendWrappedIPCTLSAESKey: (wrappedIPCTLSAESKeyIPCAPIResponse: IPCAPIResponse<ArrayBuffer>) => void;
}

export const IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS = {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: "IPCTLSBootstrap:generateAndGetMainProcessIPCTLSPublicRSAKeyDER",
  sendWrappedIPCTLSAESKey: "IPCTLSBootstrap:sendWrappedIPCTLSAESKey"
} as const;
export type IPCTLSBootstrapAPIIPCChannels = typeof IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS;
export type IPCTLSBootstrapAPIIPCChannel = IPCTLSBootstrapAPIIPCChannels[keyof IPCTLSBootstrapAPIIPCChannels];
