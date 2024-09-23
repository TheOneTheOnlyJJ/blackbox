import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IIPCTLSAPI {
  getMainProcessPublicRSAKeyDER: () => IPCAPIResponse<ArrayBuffer>;
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer) => Promise<IPCAPIResponse>;
}
