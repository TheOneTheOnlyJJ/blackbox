import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IIPCTLSBootstrapAPI {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: () => Promise<IPCAPIResponse<ArrayBuffer>>;
  sendWrappedIPCTLSAESKey: (wrappedIPCTLSAESKeyIPCAPIResponse: IPCAPIResponse<ArrayBuffer>) => void;
}

export const IPC_TLS_BOOTSTRAP_API_CHANNELS = {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: "IPCTLSBootstrap:generateAndGetMainProcessIPCTLSPublicRSAKeyDER",
  sendWrappedIPCTLSAESKey: "IPCTLSBootstrap:sendWrappedIPCTLSAESKey"
} as const;
export type IPCTLSBootstrapAPIChannels = typeof IPC_TLS_BOOTSTRAP_API_CHANNELS;
export type IPCTLSBootstrapAPIChannel = IPCTLSBootstrapAPIChannels[keyof IPCTLSBootstrapAPIChannels];
