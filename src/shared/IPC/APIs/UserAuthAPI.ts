import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";

// Utility types
export type SignedInUserChangedCallback = (newSignedInUserInfo: ISignedInUserInfo | null) => void;

export interface IUserAuthAPI {
  signUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<ISignedInUserInfo | null>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getSignedInUserInfo: () => IPCAPIResponse<ISignedInUserInfo | null>;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
}

export type UserAuthAPIIPCChannels = TransformToIPCAPIChannels<"UserAuthAPI", IUserAuthAPI>;
export type UserAuthAPIIPCChannel = UserAuthAPIIPCChannels[keyof UserAuthAPIIPCChannels];

export const USER_AUTH_API_IPC_CHANNELS: UserAuthAPIIPCChannels = {
  signUp: "UserAuthAPI:signUp",
  signIn: "UserAuthAPI:signIn",
  signOut: "UserAuthAPI:signOut",
  isUsernameAvailable: "UserAuthAPI:isUsernameAvailable",
  getSignedInUserInfo: "UserAuthAPI:getSignedInUserInfo",
  onSignedInUserChanged: "UserAuthAPI:onSignedInUserChanged"
} as const;
