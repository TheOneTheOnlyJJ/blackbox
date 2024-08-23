export interface IIPCEncryptionAPI {
  getMainProcessPublicRSAKeyDER: () => ArrayBuffer;
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer) => Promise<boolean>;
}
