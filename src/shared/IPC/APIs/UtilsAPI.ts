import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IGetDirectoryWithPickerOptions {
  pickerTitle: string;
  multiple: boolean;
}

export interface IUtilsAPI {
  getDirectoryPathWithPicker: (options: IGetDirectoryWithPickerOptions) => Promise<IPCAPIResponse<IEncryptedData<string[]> | null>>;
}

export const UTILS_API_IPC_CHANNELS = {
  getDirectoryPathWithPicker: "utilsAPI:getDirectoryPathWithPicker"
} as const;
export type UtilsAPIIPCChannels = typeof UTILS_API_IPC_CHANNELS;
export type UtilsAPIIPCChannel = UtilsAPIIPCChannels[keyof UtilsAPIIPCChannels];
