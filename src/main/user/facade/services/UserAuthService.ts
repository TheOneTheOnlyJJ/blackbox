import { LogFunctions } from "electron-log";
import { IUserSignUpPayload, isValidUserSignUpPayload } from "../../account/UserSignUpPayload";
import { userSignUpPayloadToSecuredUserSignUpPayload } from "../../account/utils/userSignUpPayloadToSecuredUserSignUpPayload";
import { IUserSignInPayload, isValidUserSignInPayload } from "../../account/UserSignInPayload";
import { timingSafeEqual, UUID } from "node:crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { deriveAESKey } from "@main/utils/encryption/deriveAESKey";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { signedInUserToSignedInUserInfo } from "../../account/utils/signedInUserToSignedInUserInfo";
import { SALT_LENGTH_BYTES } from "@main/utils/encryption/constants";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { userSignUpDTOToUserSignUpPayload } from "@main/user/account/utils/userSignUpDTOToUserSignUpPayload";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { userSignInDTOToUserSignInPayload } from "@main/user/account/utils/userSignInDTOToUserSignInPayload";
import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";

export interface IUserAuthServiceContext {
  isAccountStorageSet: () => boolean;
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  setSignedInUser: (newSignedInUser: ISignedInUser | null) => boolean;
  isUsernameAvailable: (username: string) => boolean;
  generateRandomUserId: () => UUID;
  addUser: (securedUserSignUpPayload: ISecuredUserSignUpPayload) => boolean;
  getUserId: (username: string) => UUID | null;
  getSecuredUserPassword: (userId: UUID) => ISecuredPassword | null;
  getUserDataAESKeySalt: (userId: UUID) => string | null;
}

export class UserAuthService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserAuthServiceContext;

  public constructor(logger: LogFunctions, context: IUserAuthServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Auth Service.");
    this.CONTEXT = context;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    return this.CONTEXT.isUsernameAvailable(username);
  }

  public generateRandomUserId(): UUID {
    this.logger.debug("Generating random User ID.");
    return this.CONTEXT.generateRandomUserId();
  }

  public signUpFromDTO(userSignUpDTO: IUserSignUpDTO, hashUserPasswordFunction: (userPassword: string, userPasswordSalt: Buffer) => string): boolean {
    return this.signUp(userSignUpDTOToUserSignUpPayload(userSignUpDTO, this.generateRandomUserId(), this.logger), hashUserPasswordFunction);
  }

  public signUp(
    userSignUpPayload: IUserSignUpPayload,
    hashUserPasswordFunction: (userPassword: string, userPasswordSalt: Buffer) => string
  ): boolean {
    this.logger.debug(`Signing up user: "${userSignUpPayload.username}".`);
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    if (!isValidUserSignUpPayload(userSignUpPayload)) {
      throw new Error("Invalid user sign up payload");
    }
    return this.CONTEXT.addUser(
      userSignUpPayloadToSecuredUserSignUpPayload(userSignUpPayload, SALT_LENGTH_BYTES, hashUserPasswordFunction, SALT_LENGTH_BYTES, this.logger)
    );
  }

  public signInFromDTO(userSignInDTO: IUserSignInDTO): boolean {
    return this.signIn(userSignInDTOToUserSignInPayload(userSignInDTO, this.logger));
  }

  public signIn(userSignInPayload: IUserSignInPayload): boolean {
    this.logger.debug(`Signing in user: "${userSignInPayload.username}".`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER !== null) {
      this.logger.warn(`A user is already signed in: "${JSON.stringify(this.getSignedInUserInfo())}".`);
    }
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    if (!isValidUserSignInPayload(userSignInPayload)) {
      throw new Error("Invalid user sign in payload");
    }
    // TODO: Merge this
    const USER_ID: UUID | null = this.CONTEXT.getUserId(userSignInPayload.username);
    if (USER_ID === null) {
      this.logger.debug("No user ID for given username.");
      return false;
    }
    // TODO: With this
    const SECURED_USER_PASSWORD: ISecuredPassword | null = this.CONTEXT.getSecuredUserPassword(USER_ID);
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
      this.logger.info("Password hashes do not match.");
      return false;
    }
    this.logger.info("Password hashes matched!");
    // TODO: And this?
    const DATA_AES_KEY_SALT: string | null = this.CONTEXT.getUserDataAESKeySalt(USER_ID);
    if (DATA_AES_KEY_SALT === null) {
      throw new Error(`No data encryption key salt for given user ID: "${USER_ID}"`);
    }
    const WAS_SET: boolean = this.CONTEXT.setSignedInUser({
      userId: USER_ID,
      username: userSignInPayload.username,
      userDataAESKey: deriveAESKey(userSignInPayload.password, Buffer.from(DATA_AES_KEY_SALT, "base64"), this.logger, "newly signed in user's data")
    });
    if (!WAS_SET) {
      throw new Error("Set signed in user failed");
    }
    return true;
  }

  public signOut(): ISignedInUserInfo | null {
    this.logger.debug("Signing out.");
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      this.logger.debug("No signed in user.");
      return null;
    }
    this.logger.debug(`Signing out user: "${SIGNED_IN_USER.username}".`);
    const SIGNED_OUT_USER_INFO: ISignedInUserInfo = signedInUserToSignedInUserInfo(SIGNED_IN_USER, this.logger);
    const WAS_SET: boolean = this.CONTEXT.setSignedInUser(null);
    if (!WAS_SET) {
      throw new Error("Set signed in user failed");
    }
    return SIGNED_OUT_USER_INFO;
  }

  public getSignedInUserInfo(): ISignedInUserInfo | null {
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      return null;
    }
    return signedInUserToSignedInUserInfo(SIGNED_IN_USER, this.logger);
  }
}
