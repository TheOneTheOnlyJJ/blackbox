import { LogFunctions } from "electron-log";
import { IUser, UserId } from "../IUser";
import { AccountManagerType } from "./AccountManagerType";
import { createJSONValidateFunction, isConfigValid } from "../../config/configUtils";
import { JSONSchemaType, ValidateFunction } from "ajv";

export interface BaseAccountManagerConfig {
  type: AccountManagerType;
}

export abstract class AccountManager<T extends BaseAccountManagerConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions) {
    this.logger = logger;
    this.config = config;
    this.logger.info(`Initialising "${this.config.type}" Account Manager.`);
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.CONFIG_VALIDATE_FUNCTION = createJSONValidateFunction<T>(configSchema);
    this.logger.silly(`Validating "${this.config.type}" Account Manager config.`);
    if (!isConfigValid<T>(this.config, this.CONFIG_VALIDATE_FUNCTION, this.logger)) {
      throw new Error(`Could not initialise "${this.config.type}" Account Manager`);
    }
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
