import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";

export interface IGetDirectoryPathWithPickerOptions {
  pickerTitle: string;
  multiple: boolean;
}

export interface IUtilsAPI {
  getDirectoryPathWithPicker: (options: IGetDirectoryPathWithPickerOptions) => Promise<IPCAPIResponse<IEncryptedData<string[]> | null>>;
}

export type UtilsAPIIPCChannels = TransformToIPCAPIChannels<"UtilsAPI", IUtilsAPI>;
export type UtilsAPIIPCChannel = UtilsAPIIPCChannels[keyof UtilsAPIIPCChannels];

export const UTILS_API_IPC_CHANNELS: UtilsAPIIPCChannels = {
  getDirectoryPathWithPicker: "UtilsAPI:getDirectoryPathWithPicker"
} as const;
