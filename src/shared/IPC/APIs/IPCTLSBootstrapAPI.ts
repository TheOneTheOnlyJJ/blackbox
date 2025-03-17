import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IIPCTLSBootstrapAPI {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: () => Promise<IPCAPIResponse<ArrayBuffer>>;
  sendWrappedIPCTLSAESKey: (wrappedIPCTLSAESKeyIPCAPIResponse: IPCAPIResponse<ArrayBuffer>) => void;
}

export type IPCTLSBootstrapAPIIPCChannels = TransformToIPCAPIChannels<"IPCTLSBootstrapAPI", IIPCTLSBootstrapAPI>;
export type IPCTLSBootstrapAPIIPCChannel = IPCTLSBootstrapAPIIPCChannels[keyof IPCTLSBootstrapAPIIPCChannels];

export const IPC_TLS_BOOTSTRAP_API_IPC_CHANNELS: IPCTLSBootstrapAPIIPCChannels = {
  generateAndGetMainProcessIPCTLSPublicRSAKeyDER: "IPCTLSBootstrapAPI:generateAndGetMainProcessIPCTLSPublicRSAKeyDER",
  sendWrappedIPCTLSAESKey: "IPCTLSBootstrapAPI:sendWrappedIPCTLSAESKey"
} as const;
