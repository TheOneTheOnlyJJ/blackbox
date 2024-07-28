import { UserAccountManager } from "./UserAccountManager";
import { LogFunctions } from "electron-log";
import { SQLiteUserAccountManager, SQLiteUserAccountManagerConfig } from "./SQLiteUserAccountManager";
import { UserAccountManagerType } from "./UserAccountManagerType";

export type UserAccountManagerConfig = SQLiteUserAccountManagerConfig;

export function userAccountManagerFactory(config: UserAccountManagerConfig, logger: LogFunctions): UserAccountManager<UserAccountManagerConfig> {
  switch (config.type) {
    case UserAccountManagerType.SQLite:
      return new SQLiteUserAccountManager(config, logger);
    default:
      throw new Error("Invalid user account manager type received");
  }
}
