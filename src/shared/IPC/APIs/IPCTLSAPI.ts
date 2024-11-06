import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";

export interface IIPCTLSAPI {
  getMainProcessPublicRSAKeyDER: () => IPCAPIResponse<ArrayBuffer>;
  sendRendererProcessWrappedAESKey: (rendererProcessWrappedAESKey: ArrayBuffer) => Promise<IPCAPIResponse>;
}
