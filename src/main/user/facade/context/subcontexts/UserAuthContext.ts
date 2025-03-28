import { ISignedInUser, isValidSignedInUser } from "@main/user/account/SignedInUser";
import { signedInUserToSignedInUserInfo } from "@main/user/account/utils/signedInUserToSignedInUserInfo";
import { deepFreeze } from "@main/utils/deepFreeze";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { LogFunctions } from "electron-log";
import { isDeepStrictEqual } from "node:util";

const INITIAL_SIGNED_IN_USER: Readonly<ISignedInUser> | null = null;

export class UserAuthContext {
  private readonly logger: LogFunctions;

  private signedInUser: Readonly<ISignedInUser> | null;

  public beforeSignOutCallback: ((toBeSignedOutUser: ISignedInUser) => void) | null;
  public onSignedInUserChangedCallback: ((newSignedInUser: ISignedInUser | null) => void) | null;
  public onNewSignedInUserCallback: ((newSignedInUser: ISignedInUser) => void) | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new User Auth Context.");
    this.signedInUser = INITIAL_SIGNED_IN_USER;
    this.beforeSignOutCallback = null;
    this.onSignedInUserChangedCallback = null;
    this.onNewSignedInUserCallback = null;
  }

  public getSignedInUser(): Readonly<ISignedInUser> | null {
    this.logger.info("Getting signed in user.");
    return this.signedInUser;
  }

  public setSignedInUser(newSignedInUser: ISignedInUser | null): boolean {
    this.logger.info("Setting new signed in user.");
    let frozenNewSignedInUser: Readonly<ISignedInUser> | null;
    let newSignedInUserInfo: ISignedInUserInfo | null;
    if (newSignedInUser === null) {
      frozenNewSignedInUser = null;
      newSignedInUserInfo = null;
    } else if (isValidSignedInUser(newSignedInUser)) {
      frozenNewSignedInUser = deepFreeze<ISignedInUser>(newSignedInUser);
      newSignedInUserInfo = signedInUserToSignedInUserInfo(frozenNewSignedInUser, this.logger);
    } else {
      throw new Error("Invalid new signed in user");
    }
    if (isDeepStrictEqual(this.signedInUser, frozenNewSignedInUser)) {
      this.logger.warn(`Signed in user already had this value: ${JSON.stringify(newSignedInUserInfo, null, 2)}. No-op set.`);
      if (frozenNewSignedInUser !== null) {
        this.logger.info("Corrupting new signed in user's data AES key buffer.");
        crypto.getRandomValues(frozenNewSignedInUser.userDataAESKey);
      } else {
        this.logger.info("No new signed in user data AES key buffer to corrupt.");
      }
      return false;
    }
    if (this.signedInUser !== null) {
      this.logger.info("Corrupting previous' signed in user data AES key buffer.");
      crypto.getRandomValues(this.signedInUser.userDataAESKey);
      this.beforeSignOutCallback?.(this.signedInUser);
    } else {
      this.logger.info("No previous signed in user data AES key buffer to corrupt.");
    }
    this.signedInUser = frozenNewSignedInUser;
    this.logger.info(
      `Set signed in user to: ${
        frozenNewSignedInUser === null ? "null (signed out)" : `${JSON.stringify(newSignedInUserInfo, null, 2)} (signed in)`
      }.`
    );
    this.onSignedInUserChangedCallback?.(this.signedInUser);
    if (this.signedInUser !== null) {
      if (newSignedInUserInfo === null) {
        this.logger.warn("New signed in user info is null when signed in user is not! Not calling callback!");
      } else {
        this.onNewSignedInUserCallback?.(this.signedInUser);
      }
    }
    return true;
  }
}
