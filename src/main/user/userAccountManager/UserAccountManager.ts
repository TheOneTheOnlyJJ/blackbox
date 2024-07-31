import { LogFunctions } from "electron-log";
import { IUser, UserId } from "../IUser";
import { UserAccountManagerType } from "./UserAccountManagerType";

export interface BaseUserAccountManagerConfig {
  type: UserAccountManagerType;
}

export abstract class UserAccountManager<T extends BaseUserAccountManagerConfig> {
  public readonly config: T;
  protected readonly logger: LogFunctions;

  public constructor(config: T, logger: LogFunctions) {
    this.config = config;
    this.logger = logger;
    this.logger.info(`Initialising User Account Manager of type "${this.config.type}".`);
  }

  public isConfigValid(): boolean {
    this.logger.debug("Validating config.");
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    return Object.values(UserAccountManagerType).includes(this.config.type);
  }
  public abstract isLocal(): boolean;
  public abstract addUser(user: IUser): boolean;
  public abstract deleteUser(userId: UserId): boolean;
  public abstract deleteUsers(userIds: UserId[]): boolean;
  public abstract getUser(userId: UserId): IUser;
  public abstract getUsers(userIds: UserId[]): IUser[];
  public abstract getAllUsers(): IUser[];
  public abstract getUserCount(): number;
  public abstract isIdValid(id: UserId): boolean;
  public abstract close(): boolean;
}
