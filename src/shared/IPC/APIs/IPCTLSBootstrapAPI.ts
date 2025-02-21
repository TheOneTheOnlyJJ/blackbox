export interface IIPCTLSBootstrapProgress {
  wasSuccessful: boolean;
  message: string;
}

export interface IIPCTLSBootstrapAPI {
  getPublicRSAKeyDER: () => ArrayBuffer;
  sendProgress: (progress: IIPCTLSBootstrapProgress) => void;
  sendWrappedAESKey: (wrappedAESKey: ArrayBuffer) => void;
}

export const IPC_TLS_BOOTSTRAP_API_CHANNELS = {
  getPublicRSAKeyDER: "IPCTLSBootstrap:getPublicRSAKeyDER",
  sendProgress: "IPCTLSBootstrap:sendProgress",
  sendWrappedAESKey: "IPCTLSBootstrap:sendWrappedAESKey"
} as const;
export type IPCTLSBootstrapAPIChannels = typeof IPC_TLS_BOOTSTRAP_API_CHANNELS;
export type IPCTLSBootstrapAPIChannel = IPCTLSBootstrapAPIChannels[keyof IPCTLSBootstrapAPIChannels];
