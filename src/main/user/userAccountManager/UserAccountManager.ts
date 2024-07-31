import { LogFunctions } from "electron-log";
import { IUser, UserId } from "../IUser";
import { UserAccountManagerType } from "./UserAccountManagerType";

export interface BaseUserAccountManagerConfig {
  type: UserAccountManagerType;
}

export abstract class UserAccountManager<T extends BaseUserAccountManagerConfig> {
  public readonly config: T;
  protected readonly logger: LogFunctions;

  constructor(config: T, logger: LogFunctions) {
    this.config = config;
    this.logger = logger;
    this.logger.info(`Initialising User Account Manager of type "${this.config.type}".`);
  }

  isConfigValid(): boolean {
    this.logger.debug("Validating config.");
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    return Object.values(UserAccountManagerType).includes(this.config.type);
  }
  abstract isLocal(): boolean;
  abstract addUser(user: IUser): boolean;
  abstract deleteUser(userId: UserId): boolean;
  abstract deleteUsers(userIds: UserId[]): boolean;
  abstract getUser(userId: UserId): IUser;
  abstract getUsers(userIds: UserId[]): IUser[];
  abstract getAllUsers(): IUser[];
  abstract getUserCount(): number;
  abstract isIdValid(id: UserId): boolean;
  abstract close(): boolean;
}
