import { AccountManager } from "./AccountManager";
import { LogFunctions } from "electron-log";
import { SQLiteAccountManager, SQLiteAccountManagerConfig } from "./SQLiteAccountManager";
import { AccountManagerType } from "./AccountManagerType";

export type AccountManagerConfig = SQLiteAccountManagerConfig;

export function accountManagerFactory(config: AccountManagerConfig, logger: LogFunctions): AccountManager<AccountManagerConfig> {
  switch (config.type) {
    case AccountManagerType.SQLite:
      return new SQLiteAccountManager(config, logger);
    default:
      throw new Error("Invalid user account manager type received");
  }
}
