import { LogFunctions } from "electron-log";

export class UserDataManager {
  // Logging
  private readonly logger: LogFunctions;
  // User
  private readonly USER_ID: string;

  public constructor(userId: string, logger: LogFunctions) {
    this.logger = logger;
    this.USER_ID = userId;
    this.logger.debug(`Initialising new User Data Manager for user with ID: "${this.USER_ID}"`);
  }
}
