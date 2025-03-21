import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";

export interface IUserAccountServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
}

export class UserAccountService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserAccountServiceContext;

  public constructor(logger: LogFunctions, context: IUserAccountServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Account Service.");
    this.CONTEXT = context;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.getUsernameForUserId(userId);
  }
}
