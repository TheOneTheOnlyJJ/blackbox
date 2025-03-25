import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IPCAPIResponse } from "../IPCAPIResponse";

export type UserAccountStorageChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void;
export type UserAccountStorageInfoChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo) => void;

export interface IUserAccountStorageAPI {
  isUserAccountStorageOpen: () => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getUsernameForUserId: (userId: string) => IPCAPIResponse<string | null>;
  getUserAccountStorageInfo: () => IPCAPIResponse<IUserAccountStorageInfo | null>;
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageInfoChanged: (callback: UserAccountStorageInfoChangedCallback) => () => void;
}

export type UserAccountStorageAPIIPCChannels = TransformToIPCAPIChannels<"UserAccountStorageAPI", IUserAccountStorageAPI>;
export type UserAccountStorageAPIIPCChannel = UserAccountStorageAPIIPCChannels[keyof UserAccountStorageAPIIPCChannels];

export const USER_ACCOUNT_STORAGE_API_IPC_CHANNELS: UserAccountStorageAPIIPCChannels = {
  isUserAccountStorageOpen: "UserAccountStorageAPI:isUserAccountStorageOpen",
  getUserCount: "UserAccountStorageAPI:getUserCount",
  getUsernameForUserId: "UserAccountStorageAPI:getUsernameForUserId",
  getUserAccountStorageInfo: "UserAccountStorageAPI:getUserAccountStorageInfo",
  onUserAccountStorageChanged: "UserAccountStorageAPI:onUserAccountStorageChanged",
  onUserAccountStorageInfoChanged: "UserAccountStorageAPI:onUserAccountStorageInfoChanged"
};
