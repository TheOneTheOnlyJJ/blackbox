import { LogFunctions } from "electron-log";
import { IUser, UserId } from "../IUser";
import { UserAccountManagerType } from "./UserAccountManagerType";
import { ConfigManager } from "../../config/ConfigManager";
import { JSONSchemaType } from "ajv";

export interface BaseUserAccountManagerConfig {
  type: UserAccountManagerType;
}

export abstract class UserAccountManager<T extends BaseUserAccountManagerConfig> {
  protected readonly logger: LogFunctions;
  public readonly config: T;
  protected readonly configManager: ConfigManager<T>;

  public constructor(config: T, configSchema: JSONSchemaType<T>, logger: LogFunctions) {
    this.logger = logger;
    this.config = config;
    this.logger.info(`Initialising "${this.config.type}" User Account Manager.`);
    this.logger.silly(`Config: ${JSON.stringify(this.config, null, 2)}.`);
    this.configManager = new ConfigManager<T>(configSchema, null, this.logger);
    if (!this.configManager.isConfigValid(this.config)) {
      throw new Error(`Could not initialise "${this.config.type}" User Account Manager with invalid config`);
    }
  }

  public isConfigValid(config: T): boolean {
    return this.configManager.isConfigValid(config);
  }

  public writeConfigJSON(configDir: string, configFileName: string): boolean {
    return this.configManager.writeJSON(this.config, configDir, configFileName);
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
