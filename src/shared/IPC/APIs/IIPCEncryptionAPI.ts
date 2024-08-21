export interface IIPCEncryptionAPI {
  getMainProcessPublicRSAKeyPEM: () => string;
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer) => Promise<boolean>;
}
