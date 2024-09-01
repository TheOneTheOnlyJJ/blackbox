import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IIPCEncryptionAPI {
  getMainProcessPublicRSAKeyDER: () => IPCAPIResponse<ArrayBuffer>;
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer) => Promise<IPCAPIResponse>;
}
