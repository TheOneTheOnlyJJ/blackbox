export interface IIPCTLSInitialisationProgress {
  wasSuccessful: boolean;
  message: string;
}
export const IPC_TLS_INITIALISATION_CHANNELS = {
  getMainProcessPublicRSAKeyDER: "IPCTLSInitialisation:getMainPublicRSAKeyDER",
  IPCTLSInitialisationProgress: "IPCTLSInitialisation:IPCTLSInitialisationProgress",
  sendWrappedIPCTLSAESKeyToMain: "IPCTLSInitialisation:sendWrappedIPCTLSAESKeyToMain"
} as const;
export type IPCTLSInitialisationChannels = typeof IPC_TLS_INITIALISATION_CHANNELS;
export type IPCTLSInitialisationChannel = IPCTLSInitialisationChannels[keyof IPCTLSInitialisationChannels];
