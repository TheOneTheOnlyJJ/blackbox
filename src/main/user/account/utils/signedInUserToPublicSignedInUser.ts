import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { ISignedInUser } from "../SignedInUser";
import { LogFunctions } from "electron-log";

export function signedInUserToPublicSignedInUser(signedInUser: ISignedInUser, logger: LogFunctions | null): IPublicSignedInUser {
  logger?.debug(`Converting signed in user to public signed in user.`);
  return {
    userId: signedInUser.userId,
    username: signedInUser.username
  };
}
