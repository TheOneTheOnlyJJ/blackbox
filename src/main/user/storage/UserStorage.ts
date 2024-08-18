import { LogFunctions } from "electron-log";
import { IUser, UserId } from "../IUser";
import { createJSONValidateFunction, isConfigValid } from "../../config/config";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { UserStorageType } from "./UserStorageType";

// Every user storage must have at least the type in its config (should be further narrowed down to its own in the specific config)
export interface BaseUserStorageConfig {
  type: UserStorageType;
}

export abstract class UserStorage<T extends BaseUserStorageConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  private readonly CONFIG_VALIDATE_FUNCTION: ValidateFunction<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions) {
    this.logger = logger;
    this.config = config;
    this.logger.info(`Initialising "${this.config.type}" user storage.`);
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.CONFIG_VALIDATE_FUNCTION = createJSONValidateFunction<T>(configSchema);
    this.logger.silly(`Validating "${this.config.type}" user storage config.`);
    if (!isConfigValid<T>(this.config, this.CONFIG_VALIDATE_FUNCTION, this.logger)) {
      throw new Error(`Could not initialise "${this.config.type}" user storage`);
    }
  }

  public getConfig(): T {
    return this.config;
  }

  public abstract isLocal(): boolean;
  public abstract isUsernameAvailable(username: string): boolean;
  public abstract addUser(userData: IUser): boolean;
  public abstract deleteUser(userId: UserId): boolean;
  public abstract deleteUsers(userIds: UserId[]): boolean;
  public abstract getUser(userId: UserId): IUser;
  public abstract getUsers(userIds: UserId[]): IUser[];
  public abstract getAllUsers(): IUser[];
  public abstract getUserCount(): number;
  public abstract isIdValid(id: UserId): boolean;
  public abstract close(): boolean;
}
