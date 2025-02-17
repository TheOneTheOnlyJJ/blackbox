import { IBaseUserAccountStorageBackendConfig, UserAccountStorageBackend } from "../UserAccountStorageBackend";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendTypes } from "../UserAccountStorageBackendType";
import { ISecuredUserSignUpData } from "@main/user/account/SecuredNewUserData";
import { UUID } from "crypto";
import { UserDataStorageConfig } from "@main/user/data/storage/UserDataStorageConfig";
import { ISecuredUserDataStorageConfigWithMetadata } from "@main/user/data/storage/SecuredUserDataStorageConfigWithMetadata";
import { ISecuredPasswordData } from "@shared/utils/ISecuredPasswordData";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS } from "@shared/user/account/storage/constants/LocalSQLiteUserAccountStorageBackendConstants";

export interface ILocalSQLiteUserAccountStorageBackendConfig extends IBaseUserAccountStorageBackendConfig {
  type: UserAccountStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

type SQLiteJournalModePragmaResult = undefined | null | string;
type SQLiteForeignKeysPragmaResult = undefined | null | 0 | 1;

interface ISQLiteVersion {
  version: string;
}

interface IRawSecuredUserDataStorageConfigWithMetadata {
  configId: UUID;
  name: string;
  visibilityPasswordHash: Buffer | null;
  visibilityPasswordSalt: Buffer | null;
  config: string;
}

export class LocalSQLiteUserAccountStorageBackend extends UserAccountStorageBackend<ILocalSQLiteUserAccountStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite]
      },
      dbDirPath: {
        type: "string",
        title: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS.dbDirPath.title,
        minLength: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS.dbDirPath.minLength
      },
      dbFileName: {
        type: "string",
        title: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS.dbFileName.title,
        minLength: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_CONSTANTS.dbFileName.minLength
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  };

  private readonly db: Database;

  public constructor(config: ILocalSQLiteUserAccountStorageBackendConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA, logger, ajv);
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
    this.logger.debug(`Using SQLite version: "${(this.db.prepare("SELECT sqlite_version() AS version").get() as ISQLiteVersion).version}".`);
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
    this.logger.info(`"${this.config.type}" User Acount Storage Backend ready.`);
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

  public doesUserWithIdExist(userId: UUID): boolean {
    this.logger.debug(`Checking if user with ID "${userId}" exists.`);
    const DOES_USER_WITH_ID_EXIST_SQL = `SELECT COUNT(*) AS count FROM users WHERE user_id = @userId`;
    const RESULT = this.db.prepare(DOES_USER_WITH_ID_EXIST_SQL).get({ userId: userId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User with ID "${userId}" does not exist.`);
      return false;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User with ID "${userId}" does exist.`);
      return true;
    }
    throw new Error(`Found ${RESULT.count.toString()} users with same ID "${userId}".`);
  }

  public addUser(userData: ISecuredUserSignUpData): boolean {
    this.logger.debug(`Adding new user: "${userData.username}".`);
    const INSERT_NEW_USER_SQL =
      "INSERT INTO users (user_id, username, password_hash, password_salt) VALUES (@userId, @username, @passwordHash, @passwordSalt)";
    try {
      const RUN_RESULT: RunResult = this.db.prepare(INSERT_NEW_USER_SQL).run({
        userId: userData.userId,
        username: userData.username,
        passwordHash: userData.password.hash,
        passwordSalt: userData.password.salt
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

  public getPasswordData(userId: UUID): ISecuredPasswordData | null {
    this.logger.debug(`Getting password salt for user with ID: "${userId}".`);
    const GET_USER_PASSWORD_SALT_SQL =
      "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_PASSWORD_SALT_SQL).get({ userId: userId }) as { passwordHash: Buffer; passwordSalt: Buffer } | undefined;
    return RESULT === undefined ? null : { hash: RESULT.passwordHash, salt: RESULT.passwordSalt };
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const USER_COUNT_SQL = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(USER_COUNT_SQL).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  private isJSONValidInSQLite(json: object | string, jsonPurpose: string): boolean {
    if (typeof json === "object") {
      json = JSON.stringify(json, null, 2);
    }
    this.logger.log(`Performing SQLite JSON validation on ${jsonPurpose}.`);
    const VALIDATE_JSON_SQL = "SELECT json_valid(@json) AS isValid";
    const RESULT = this.db.prepare(VALIDATE_JSON_SQL).get({ json: json }) as { isValid: 0 | 1 };
    const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
    this.logger.debug(`JSON validity in SQLite: "${IS_VALID.toString()}".`);
    return IS_VALID;
  }

  public addUserDataStorageConfigToUser(userId: UUID, securedUserDataStorageConfigWithMetadata: ISecuredUserDataStorageConfigWithMetadata): boolean {
    this.logger.debug(`Adding new User Data Storage Config to user with ID: "${userId}".`);
    // Validate config
    this.logger.debug("Validating User Data Storage Config.");
    if (!this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION(securedUserDataStorageConfigWithMetadata.config)) {
      this.logger.debug("Invalid User Data Storage Config.");
      this.logger.error("Validation errors:");
      this.USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
    const STRINGIFIED_USER_DATA_STORAGE_CONFIG: string = JSON.stringify(securedUserDataStorageConfigWithMetadata.config, null, 2);
    // Validate stringified config as JSON at SQLite level
    if (!this.isJSONValidInSQLite(STRINGIFIED_USER_DATA_STORAGE_CONFIG, "user data storage config")) {
      this.logger.error("User Data Storage Config invalid as SQLite JSON. Cannot add to user account.");
      return false;
    }
    this.logger.debug("Valid User Data Storage Config. Attempting to add to database.");
    // TODO: Config should be encrypted blob
    const ADD_USER_DATA_STORAGE_CONFIG_SQL = `
    INSERT INTO user_data_storage_configs (
      config_id, user_id, name, visibility_password_hash, visibility_password_salt, config
    ) VALUES (
      @configId, @userId, @name, @visibilityPasswordHash, @visibilityPasswordSalt, jsonb(@config)
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_DATA_STORAGE_CONFIG_SQL).run({
        configId: securedUserDataStorageConfigWithMetadata.configId,
        userId: userId,
        name: securedUserDataStorageConfigWithMetadata.name,
        visibilityPasswordHash: securedUserDataStorageConfigWithMetadata.visibilityPassword?.hash ?? null,
        visibilityPasswordSalt: securedUserDataStorageConfigWithMetadata.visibilityPassword?.salt ?? null,
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

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfigWithMetadata[] {
    this.logger.debug(`Getting all User Data Storage Configs for user with ID: "${userId}".`);
    // TODO: Config should be encrypted blob
    const GET_ALL_SECURED_USER_DATA_STORAGE_CONFIGS_SQL = `
    SELECT
      config_id AS configId,
      name,
      visibility_password_hash AS visibilityPasswordHash,
      visibility_password_salt AS visibilityPasswordSalt,
      json(config) AS config
    FROM user_data_storage_configs WHERE user_id = @userId`;
    const RESULT = this.db
      .prepare(GET_ALL_SECURED_USER_DATA_STORAGE_CONFIGS_SQL)
      .all({ userId: userId }) as IRawSecuredUserDataStorageConfigWithMetadata[];
    this.logger.warn(JSON.stringify(RESULT, null, 2));
    const SECURED_USER_DATA_STORAGE_CONFIGS_WITH_METADATA: ISecuredUserDataStorageConfigWithMetadata[] = [];
    try {
      RESULT.map((rawSecuredUserDataStorageConfigWithMetadata: IRawSecuredUserDataStorageConfigWithMetadata) => {
        this.logger.debug("Determining visibility password.");
        const VISIBILITY_PASSWORD: ISecuredPasswordData | undefined =
          rawSecuredUserDataStorageConfigWithMetadata.visibilityPasswordHash !== null &&
          rawSecuredUserDataStorageConfigWithMetadata.visibilityPasswordSalt !== null
            ? {
                hash: rawSecuredUserDataStorageConfigWithMetadata.visibilityPasswordHash,
                salt: rawSecuredUserDataStorageConfigWithMetadata.visibilityPasswordSalt
              }
            : undefined;
        this.logger.silly(VISIBILITY_PASSWORD !== undefined ? "Config has visibility password." : "Config does not have visibility password.");
        this.logger.debug("Parsing User Data Storage Config.");
        const PARSED_USER_DATA_STORAGE_CONFIG: UserDataStorageConfig = JSON.parse(
          rawSecuredUserDataStorageConfigWithMetadata.config
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
        SECURED_USER_DATA_STORAGE_CONFIGS_WITH_METADATA.push({
          configId: rawSecuredUserDataStorageConfigWithMetadata.configId,
          name: rawSecuredUserDataStorageConfigWithMetadata.name,
          visibilityPassword: VISIBILITY_PASSWORD,
          config: PARSED_USER_DATA_STORAGE_CONFIG
        });
      });
      return SECURED_USER_DATA_STORAGE_CONFIGS_WITH_METADATA;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not parse results! ${ERROR_MESSAGE}!`);
      return [];
    }
  }

  public close(): boolean {
    this.logger.debug(`Closing "${this.config.type}" User Account Storage Backend.`);
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
      // TODO: Config should be encrypted blob
      const CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configs (
        config_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        name TEXT NOT NULL,
        visibility_password_hash BLOB,
        visibility_password_salt BLOB,
        config BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_configs" table.');
    }
  }
}
