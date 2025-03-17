import { LogFunctions } from "electron-log";
import { IUserSignUpPayload, USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignUpPayload";
import { UserAccountStorage } from "./account/storage/UserAccountStorage";
import { userSignUpPayloadToSecuredUserSignUpPayload } from "./account/utils/userSignUpPayloadToSecuredUserSignUpPayload";
import { IUserSignInPayload, USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION } from "./account/UserSignInPayload";
import { timingSafeEqual, UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { ISignedInUser } from "./account/SignedInUser";
import { deriveAESKey } from "@main/utils/encryption/deriveAESKey";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { signedInUserToSignedInUserInfo } from "./account/utils/signedInUserToSignedInUserInfo";

export class UserAuthenticator {
  private logger: LogFunctions;

  private readonly USER_PASSWORD_SALT_LENGTH_BYTES = 32;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.debug("Initialising new User Authenticator.");
  }

  public signUp(
    userAccountStorage: UserAccountStorage,
    userSignUpPayload: IUserSignUpPayload,
    hashUserPasswordFunction: (userPassword: string, userPasswordSalt: Buffer) => string
  ): boolean {
    this.logger.debug(`Signing up user: "${userSignUpPayload.username}".`);
    if (!USER_SIGN_UP_PAYLOAD_VALIDATE_FUNCTION(userSignUpPayload)) {
      throw new Error("Invalid user sign up payload");
    }
    return userAccountStorage.addUser(
      userSignUpPayloadToSecuredUserSignUpPayload(userSignUpPayload, this.USER_PASSWORD_SALT_LENGTH_BYTES, hashUserPasswordFunction, this.logger)
    );
  }

  public signIn(
    userAccountStorage: UserAccountStorage,
    userSignInPayload: IUserSignInPayload,
    signedInUser: { value: ISignedInUser | null }
  ): boolean {
    this.logger.debug(`Signing in user: "${userSignInPayload.username}".`);
    if (!USER_SIGN_IN_PAYLOAD_VALIDATE_FUNCTION(userSignInPayload)) {
      throw new Error("Invalid user sign in payload");
    }
    // TODO: Merge this
    const USER_ID: UUID | null = userAccountStorage.getUserId(userSignInPayload.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username.");
      return false;
    }
    // TODO: With this
    const SECURED_USER_PASSWORD: ISecuredPassword | null = userAccountStorage.getSecuredUserPassword(USER_ID);
    if (SECURED_USER_PASSWORD === null) {
      throw new Error(`No password hash and salt for user: "${USER_ID}"`);
    }
    const SIGN_IN_PASSWORD_HASH: Buffer = hashPassword(
      userSignInPayload.password,
      Buffer.from(SECURED_USER_PASSWORD.salt, "base64"),
      this.logger,
      "user sign in"
    );
    if (!timingSafeEqual(SIGN_IN_PASSWORD_HASH, Buffer.from(SECURED_USER_PASSWORD.hash, "base64"))) {
      this.logger.debug("Password hashes do not match.");
      return false;
    }
    this.logger.debug("Password hashes matched!");
    // TODO: And this?
    const DATA_ENCRYPTION_KEY_SALT: string | null = userAccountStorage.getUserDataEncryptionAESKeySalt(USER_ID);
    if (DATA_ENCRYPTION_KEY_SALT === null) {
      throw new Error(`No data encryption key salt for given user ID: "${USER_ID}"`);
    }
    signedInUser.value = {
      userId: USER_ID,
      username: userSignInPayload.username,
      userDataAESKey: deriveAESKey(
        userSignInPayload.password,
        Buffer.from(DATA_ENCRYPTION_KEY_SALT, "base64"),
        this.logger,
        "newly signed in user's data"
      )
    };
    return true;
  }

  public signOut(signedInUser: { value: ISignedInUser | null }): ISignedInUserInfo | null {
    this.logger.debug("Signing out.");
    if (signedInUser.value === null) {
      this.logger.debug("No signed in user.");
      return null;
    }
    this.logger.debug(`Signing out user: "${signedInUser.value.username}".`);
    const SIGNED_OUT_USER_INFO: ISignedInUserInfo = signedInUserToSignedInUserInfo(signedInUser.value, this.logger);
    signedInUser.value = null; // AES key gets corrupted in proxy
    return SIGNED_OUT_USER_INFO;
  }
}
