import { LogFunctions } from "electron-log";
import { ISecuredUserSignUpPayload } from "../SecuredUserSignUpPayload";
import { IUserSignUpPayload } from "../UserSignUpPayload";
import { randomBytes } from "node:crypto";

export const userSignUpPayloadToSecuredUserSignUpPayload = (
  userSignUpPayload: IUserSignUpPayload,
  userPasswordSaltLengthBytes: number,
  hashUserPasswordFunction: (userPassword: string, userPasswordSalt: Buffer) => string,
  userDataAESKeySaltLengthBytes: number,
  logger: LogFunctions | null
): ISecuredUserSignUpPayload => {
  logger?.info("Converting user sign up payload to secured user sign up payload.");
  const PASSWORD_SALT: Buffer = randomBytes(userPasswordSaltLengthBytes);
  return {
    userId: userSignUpPayload.userId,
    username: userSignUpPayload.username,
    securedPassword: {
      hash: hashUserPasswordFunction(userSignUpPayload.password, PASSWORD_SALT),
      salt: PASSWORD_SALT.toString("base64")
    },
    dataAESKeySalt: randomBytes(userDataAESKeySaltLengthBytes).toString("base64")
  };
};
