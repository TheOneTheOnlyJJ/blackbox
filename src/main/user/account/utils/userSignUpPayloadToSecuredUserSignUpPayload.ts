import { LogFunctions } from "electron-log";
import { ISecuredUserSignUpPayload } from "../SecuredUserSignUpPayload";
import { IUserSignUpPayload } from "../UserSignUpPayload";
import { randomBytes } from "node:crypto";

export const userSignUpPayloadToSecuredUserSignUpPayload = (
  userSignUpPayload: IUserSignUpPayload,
  userPasswordSaltLength: number,
  hashUserPasswordFunction: (userPassword: string, userPasswordSalt: Buffer) => string,
  logger: LogFunctions
): ISecuredUserSignUpPayload => {
  logger.info("Converting user sign up payload to secured user sign up payload.");
  const PASSWORD_SALT: Buffer = randomBytes(userPasswordSaltLength);
  return {
    userId: userSignUpPayload.userId,
    username: userSignUpPayload.username,
    securedPassword: {
      hash: hashUserPasswordFunction(userSignUpPayload.password, PASSWORD_SALT),
      salt: PASSWORD_SALT.toString("base64")
    },
    dataEncryptionAESKeySalt: randomBytes(userPasswordSaltLength).toString("base64")
  };
};
