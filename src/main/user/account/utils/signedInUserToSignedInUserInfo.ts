import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { ISignedInUser } from "../SignedInUser";
import { LogFunctions } from "electron-log";

export function signedInUserToSignedInUserInfo(signedInUser: Readonly<ISignedInUser>, logger: LogFunctions | null): ISignedInUserInfo {
  logger?.debug(`Converting signed in user to signed in user info.`);
  return {
    userId: signedInUser.userId,
    username: signedInUser.username
  };
}
