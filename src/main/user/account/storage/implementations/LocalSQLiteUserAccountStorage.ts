import { IBaseUserAccountStorageConfig, UserAccountStorage } from "../UserAccountStorage";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_TYPE, UserAccountStorageTypes } from "../UserAccountStorageType";
import { ISecuredUserSignUpData } from "@main/user/account/SecuredNewUserData";
import { UUID } from "crypto";
import { UserDataStorageConfig } from "@main/user/data/storage/UserDataStorageConfig";
import { IUserDataStorageConfigWithMetadata } from "@main/user/data/storage/UserDataStorageConfigWithMetadata";

export interface ILocalSQLiteUserAccountStorageConfig extends IBaseUserAccountStorageConfig {
  type: UserAccountStorageTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

type SQLiteJournalModePragmaResult = undefined | null | string;
type SQLiteForeignKeysPragmaResult = undefined | null | 0 | 1;

interface SQLiteVersion {
  version: string;
}

export class LocalSQLiteUserAccountStorage extends UserAccountStorage<ILocalSQLiteUserAccountStorageConfig> {
  public static readonly CONFIG_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_ACCOUNT_STORAGE_TYPE.LocalSQLite]
      },
      dbDirPath: {
        type: "string",
        minLength: 1
      },
      dbFileName: {
        type: "string",
        minLength: 1
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  };

  private readonly db: Database;

  public constructor(config: ILocalSQLiteUserAccountStorageConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserAccountStorage.CONFIG_SCHEMA, logger, ajv);
    // Create db and directories
    if (existsSync(this.config.dbDirPath)) {
      this.logger.debug(`Found database directory at path: "${this.config.dbDirPath}". Looking for SQLite file.`);
    } else {
      this.logger.debug(`Could not find database directory path: "${this.config.dbDirPath}". Creating required directories.`);
      mkdirSync(this.config.dbDirPath, { recursive: true });
      this.logger.debug(`Database directory path created: "${this.config.dbDirPath}".`);
    }
    const DB_FILE_PATH: string = join(this.config.dbDirPath, this.config.dbFileName);
    if (existsSync(DB_FILE_PATH)) {
      this.logger.debug(`Found SQLite file "${this.config.dbFileName}" at path: "${DB_FILE_PATH}". Opening.`);
    } else {
      this.logger.debug(`Could not find SQLite file "${this.config.dbFileName}" at path: "${DB_FILE_PATH}". Creating new.`);
    }
    this.logger.silly("Running SQLite database constructor.");
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    this.logger.silly("SQLite database constructor completed.");
    // Log SQLite version
    this.logger.debug(`Using SQLite version: "${(this.db.prepare("SELECT sqlite_version() AS version").get() as SQLiteVersion).version}".`);
    // Config
    // Journal mode
    this.logger.debug("Setting journal mode to WAL.");
    this.db.pragma("journal_mode = WAL");
    const JOURNAL_MODE: SQLiteJournalModePragmaResult = this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalModePragmaResult;
    this.logger.silly(`Journal mode: "${String(JOURNAL_MODE)}".`);
    // Foreign keys
    this.logger.debug("Setting on foreign key support.");
    this.db.pragma("foreign_keys = ON");
    const FOREIGN_KEYS: SQLiteForeignKeysPragmaResult = this.db.pragma("foreign_keys", { simple: true }) as SQLiteForeignKeysPragmaResult;
    this.logger.silly(`Foreign keys: "${String(FOREIGN_KEYS)}".`);
    // Initialise required tables
    this.initialiseUsersTable();
    this.initialiseUserDataStorageConfigsTable();
    this.logger.info(`"${this.config.type}" User Acount Storage ready.`);
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Checking username availability for username: "${username}".`);
    const IS_USERNAME_AVAILABLE_SQL = "SELECT COUNT(*) AS count FROM users WHERE username = @username";
    const RESULT = this.db.prepare(IS_USERNAME_AVAILABLE_SQL).get({ username: username }) as { count: number };
    if (RESULT.count > 0) {
      this.logger.debug(`Username "${username}" is unavailable.`);
      return false;
    }
    this.logger.debug(`Username "${username}" is available.`);
    return true;
  }

  public addUser(userData: ISecuredUserSignUpData): boolean {
    this.logger.debug(`Adding new user: "${userData.username}".`);
    const INSERT_NEW_USER_SQL =
      "INSERT INTO users (user_id, username, password_hash, password_salt) VALUES (@userId, @username, @passwordHash, @passwordSalt)";
    try {
      const RUN_RESULT: RunResult = this.db.prepare(INSERT_NEW_USER_SQL).run({
        userId: userData.userId,
        username: userData.username,
        passwordHash: userData.passwordHash,
        passwordSalt: userData.passwordSalt
      });
      this.logger.info("User added successfully!");
      this.logger.silly(`Number of changes: "${RUN_RESULT.changes.toString()}". Last inserted row ID: "${RUN_RESULT.lastInsertRowid.toString()}".`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not add user! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getUserId(username: string): UUID | null {
    this.logger.debug(`Getting user ID for user: "${username}".`);
    const GET_USER_ID_SQL = "SELECT user_id AS userId FROM users WHERE username = @username LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_ID_SQL).get({ username: username }) as { userId: UUID } | undefined;
    return RESULT === undefined ? null : RESULT.userId;
  }

  public getPasswordData(userId: UUID): [Buffer, Buffer] | null {
    this.logger.debug(`Getting password salt for user with ID: "${userId}".`);
    const GET_USER_PASSWORD_SALT_SQL =
      "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_PASSWORD_SALT_SQL).get({ userId: userId }) as { passwordHash: Buffer; passwordSalt: Buffer } | undefined;
    return RESULT === undefined ? null : [RESULT.passwordHash, RESULT.passwordSalt];
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const USER_COUNT_SQL = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(USER_COUNT_SQL).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  private isJSONValidInSQLite(json: object | string): boolean {
    if (typeof json === "object") {
      json = JSON.stringify(json, null, 2);
    }
    this.logger.log(`Performing SQLite JSON validation on: "${json}".`);
    const VALIDATE_JSON_SQL = "SELECT json_valid(@json) AS isValid";
    const RESULT = this.db.prepare(VALIDATE_JSON_SQL).get({ json: json }) as { isValid: 0 | 1 };
    const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
    this.logger.debug(`JSON validity in SQLite: "${IS_VALID.toString()}".`);
    return IS_VALID;
  }

  public addUserDataStorageConfig(userId: UUID, userDataStorageConfigWithMetadata: IUserDataStorageConfigWithMetadata): boolean {
    this.logger.debug(`Adding new User Data Storage Config to user with ID: "${userId}".`);
    // Validate config
    this.logger.debug("Validating User Data Storage Config.");
    if (!this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION(userDataStorageConfigWithMetadata.config)) {
      this.logger.debug("Invalid User Data Storage Config.");
      this.logger.error("Validation errors:");
      this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
    this.logger.debug("Valid User Data Storage Config.");
    const STRINGIFIED_USER_DATA_STORAGE_CONFIG: string = JSON.stringify(userDataStorageConfigWithMetadata.config, null, 2);
    // Validate stringified config as JSON at SQLite level
    if (!this.isJSONValidInSQLite(STRINGIFIED_USER_DATA_STORAGE_CONFIG)) {
      this.logger.debug("Invalid User Data Storage Config. Cannot add to user account.");
      return false;
    }
    this.logger.debug("Valid User Data Storage Config. Attempting to add to database.");
    const ADD_USER_DATA_STORAGE_CONFIG_SQL =
      "INSERT INTO user_data_storage_configs (config_id, user_id, name, config) VALUES (@configId, @userId, @name, jsonb(@config))";
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_DATA_STORAGE_CONFIG_SQL).run({
        configId: userDataStorageConfigWithMetadata.configId,
        userId: userId,
        name: userDataStorageConfigWithMetadata.name,
        config: STRINGIFIED_USER_DATA_STORAGE_CONFIG
      });
      this.logger.info("User Data Storage Config added successfully!");
      this.logger.silly(`Number of changes: "${RUN_RESULT.changes.toString()}". Last inserted row ID: "${RUN_RESULT.lastInsertRowid.toString()}".`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not add User Data Storage Config! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getAllUserDataStorageConfigs(userId: UUID): IUserDataStorageConfigWithMetadata[] {
    this.logger.debug(`Getting all User Data Storage Configs for user with ID: "${userId}".`);
    const GET_ALL_USER_DATA_STORAGE_CONFIGS_SQL =
      "SELECT config_id AS configId, name, json(config) AS config FROM user_data_storage_configs WHERE user_id = @userId";
    const RESULT = this.db.prepare(GET_ALL_USER_DATA_STORAGE_CONFIGS_SQL).all({ userId: userId }) as {
      configId: UUID;
      name: string;
      config: string;
    }[];
    this.logger.warn(JSON.stringify(RESULT, null, 2));
    const USER_DATA_STORAGE_CONFIGS_WITH_METADATA: IUserDataStorageConfigWithMetadata[] = [];
    try {
      RESULT.map((rawUserDataStorageConfigWithMetadata: { configId: UUID; name: string; config: string }) => {
        this.logger.debug("Parsing User Data Storage Config.");
        const PARSED_USER_DATA_STORAGE_CONFIG: UserDataStorageConfig = JSON.parse(
          rawUserDataStorageConfigWithMetadata.config
        ) as UserDataStorageConfig;
        this.logger.debug("Validating parsed User Data Storage Config.");
        if (!this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION(PARSED_USER_DATA_STORAGE_CONFIG)) {
          this.logger.debug("Invalid User Data Storage Config.");
          this.logger.error("Validation errors:");
          this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
            this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
          });
          return;
        }
        this.logger.debug("Valid User Data Storage Config.");
        USER_DATA_STORAGE_CONFIGS_WITH_METADATA.push({
          configId: rawUserDataStorageConfigWithMetadata.configId,
          name: rawUserDataStorageConfigWithMetadata.name,
          config: PARSED_USER_DATA_STORAGE_CONFIG
        });
      });
      return USER_DATA_STORAGE_CONFIGS_WITH_METADATA;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not parse results! ${ERROR_MESSAGE}!`);
      return [];
    }
  }

  public close(): boolean {
    this.logger.debug(`Closing "${this.config.type}" User Account Storage.`);
    this.db.close();
    return true;
  }

  private initialiseUsersTable(): void {
    this.logger.debug('Initialising "users" table.');
    const SELECT_USERS_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
    const DOES_USERS_TABLE_EXIST: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (DOES_USERS_TABLE_EXIST) {
      this.logger.debug('Found "users" table.');
    } else {
      this.logger.debug('Did not find "users" table. Creating.');
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash BLOB NOT NULL,
        password_salt BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }

  private initialiseUserDataStorageConfigsTable(): void {
    this.logger.debug('Initialising "user_data_storage_configs" table.');
    const SELECT_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_configs'";
    const DOES_USER_DATA_STORAGE_CONFIGS_TABLE_EXIST: boolean = this.db.prepare(SELECT_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).get() !== undefined;
    if (DOES_USER_DATA_STORAGE_CONFIGS_TABLE_EXIST) {
      this.logger.debug('Found "user_data_storage_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_configs" table. Creating.');
      const CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configs (
        config_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        name TEXT NOT NULL,
        config BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_configs" table.');
    }
  }
}
