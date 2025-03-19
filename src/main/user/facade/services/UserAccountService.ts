import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { IUserAccountStorageProxy } from "../proxies/UserAccountStorageProxy";

export interface IUserAccountServiceContext {
  accountStorage: IUserAccountStorageProxy;
}

export class UserAccountService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserAccountServiceContext;

  public constructor(logger: LogFunctions, context: IUserAccountServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Account Service.");
    this.CONTEXT = context;
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Getting username availability for username: "${username}".`);
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.isUsernameAvailable(username);
  }

  public generateRandomUserId(): UUID {
    this.logger.debug("Generating random User ID.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.generateRandomUserId();
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    if (this.CONTEXT.accountStorage.value === null) {
      throw new Error("Null User Account Storage");
    }
    return this.CONTEXT.accountStorage.value.getUsernameForUserId(userId);
  }
}
