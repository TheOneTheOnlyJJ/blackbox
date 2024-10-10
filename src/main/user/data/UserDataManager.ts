import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export class UserDataManager {
  // Logging
  private readonly logger: LogFunctions;
  // User
  private readonly USER_ID: UUID;

  public constructor(userId: UUID, logger: LogFunctions) {
    this.logger = logger;
    this.USER_ID = userId;
    this.logger.debug(`Initialising new User Data Manager for user with ID: "${this.USER_ID}"`);
  }
}
