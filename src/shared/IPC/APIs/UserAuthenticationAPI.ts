import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";

// Utility types
export type SignedInUserChangedCallback = (newSignedInUserInfo: ISignedInUserInfo | null) => void;

export interface IUserAuthenticationAPI {
  signUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<ISignedInUserInfo | null>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getSignedInUserInfo: () => IPCAPIResponse<ISignedInUserInfo | null>;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
}

export type UserAuthenticationAPIIPCChannels = TransformToIPCAPIChannels<"UserAuthAPI", IUserAuthenticationAPI>;
export type UserAuthenticationAPIIPCChannel = UserAuthenticationAPIIPCChannels[keyof UserAuthenticationAPIIPCChannels];

export const USER_AUTHENTICATION_API_IPC_CHANNELS: UserAuthenticationAPIIPCChannels = {
  signUp: "UserAuthAPI:signUp",
  signIn: "UserAuthAPI:signIn",
  signOut: "UserAuthAPI:signOut",
  isUsernameAvailable: "UserAuthAPI:isUsernameAvailable",
  getSignedInUserInfo: "UserAuthAPI:getSignedInUserInfo",
  onSignedInUserChanged: "UserAuthAPI:onSignedInUserChanged"
} as const;
