import { BaseUserAccountStorageBackend } from "../../BaseUserAccountStorageBackend";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendTypes } from "../../UserAccountStorageBackendType";
import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";
import { UUID } from "crypto";
import { UserDataStorageBackendConfig } from "@main/user/data/storage/backend/config/UserDataStorageBackendConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";
import { IBaseUserAccountStorageBackendConfig } from "../../config/BaseUserAccountStorageBackendConfig";

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

interface IRawSecuredUserDataStorageConfig {
  storageId: UUID;
  name: string;
  description: string | null;
  visibilityPasswordHash: string | null;
  visibilityPasswordSalt: string | null;
  config: string;
}

export class LocalSQLiteUserAccountStorageBackend extends BaseUserAccountStorageBackend<ILocalSQLiteUserAccountStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite],
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;

  private db: Database | null;

  public constructor(config: ILocalSQLiteUserAccountStorageBackendConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA, logger, ajv);
    this.db = null;
  }

  public isOpen(): boolean {
    return this.db !== null;
  }

  public open(): void {
    this.logger.info(`Opening "${this.config.type}" User Account Storage Backend.`);
    if (this.isOpen()) {
      this.logger.warn(`Already opened "${this.config.type}" User Account Storage Backend. No-op.`);
      return;
    }
    // Create db and directories
    if (existsSync(this.config.dbDirPath)) {
      this.logger.debug(`Found database directory path: "${this.config.dbDirPath}".`);
    } else {
      this.logger.debug(`No database directory path: "${this.config.dbDirPath}".`);
      mkdirSync(this.config.dbDirPath, { recursive: true });
      this.logger.debug(`Created database directory path: "${this.config.dbDirPath}".`);
    }
    const DB_FILE_PATH: string = join(this.config.dbDirPath, this.config.dbFileName);
    if (existsSync(DB_FILE_PATH)) {
      this.logger.debug(`Found existing database "${this.config.dbFileName}" at path: "${DB_FILE_PATH}".`);
    } else {
      this.logger.debug(`No existing database "${this.config.dbFileName}" at path: "${DB_FILE_PATH}".`);
    }
    this.db = new DatabaseConstructor(DB_FILE_PATH);
    this.logger.debug("Created database.");
    // Log SQLite version
    this.logger.debug(`SQLite version: ${(this.db.prepare("SELECT sqlite_version() AS version").get() as ISQLiteVersion).version}.`);
    // Journal mode
    this.db.pragma("journal_mode = WAL");
    const JOURNAL_MODE: SQLiteJournalModePragmaResult = this.db.pragma("journal_mode", { simple: true }) as SQLiteJournalModePragmaResult;
    this.logger.debug(`Journal mode: "${String(JOURNAL_MODE)}".`);
    // Foreign keys
    this.db.pragma("foreign_keys = ON");
    const FOREIGN_KEYS: SQLiteForeignKeysPragmaResult = this.db.pragma("foreign_keys", { simple: true }) as SQLiteForeignKeysPragmaResult;
    this.logger.debug(`Foreign keys: ${String(FOREIGN_KEYS)}.`);
    if (FOREIGN_KEYS !== 1) {
      throw new Error("Could not enable foreign keys");
    }
    // Create tables
    this.createUsersTable();
    this.createUserDataStorageConfigsTable();
    this.logger.info(`Opened "${this.config.type}" User Acount Storage Backend.`);
  }

  public close(): void {
    this.logger.info(`Closing "${this.config.type}" User Account Storage Backend.`);
    if (this.db === null) {
      this.logger.warn(`Already closed "${this.config.type}" User Account Storage Backend. No-op.`);
      return;
    }
    this.db.close();
    this.db = null;
    this.logger.info(`Closed "${this.config.type}" User Account Storage Backend.`);
  }

  public isLocal(): boolean {
    return true;
  }

  private isJSONValidInSQLite(json: object | string, jsonPurposeToLog: string): boolean {
    if (typeof json === "object") {
      json = JSON.stringify(json, null, 2);
    }
    this.logger.log(`Performing SQLite JSON validation on ${jsonPurposeToLog}.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const IS_JSON_VALID_SQL = "SELECT json_valid(@json) AS isValid";
    const RESULT = this.db.prepare(IS_JSON_VALID_SQL).get({ json: json }) as { isValid: 0 | 1 };
    const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
    this.logger.debug(`JSON validity in SQLite: ${IS_VALID.toString()}.`);
    return IS_VALID;
  }

  public isUserIdAvailable(userId: UUID): boolean {
    this.logger.debug(`Checking if user ID "${userId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const IS_USER_ID_AVAILABLE_SQL = `SELECT COUNT(*) AS count FROM users WHERE user_id = @userId`;
    const RESULT = this.db.prepare(IS_USER_ID_AVAILABLE_SQL).get({ userId: userId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User ID "${userId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User ID "${userId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) users with same ID "${userId}"`);
  }

  public isUsernameAvailable(username: string): boolean {
    this.logger.debug(`Checking if username "${username}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const IS_USERNAME_AVAILABLE_SQL = "SELECT COUNT(*) AS count FROM users WHERE username = @username";
    const RESULT = this.db.prepare(IS_USERNAME_AVAILABLE_SQL).get({ username: username }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`Username "${username}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`Username "${username}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) users with same username "${username}"`);
  }

  public addUser(securedUserSignInPayload: ISecuredUserSignUpPayload): boolean {
    this.logger.debug(`Adding user: "${securedUserSignInPayload.username}" with ID: "${securedUserSignInPayload.userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const ADD_USER_SQL =
      "INSERT INTO users (user_id, username, password_hash, password_salt) VALUES (@userId, @username, @passwordHash, @passwordSalt)";
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_SQL).run({
        userId: securedUserSignInPayload.userId,
        username: securedUserSignInPayload.username,
        passwordHash: securedUserSignInPayload.securedPassword.hash,
        passwordSalt: securedUserSignInPayload.securedPassword.salt
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not add user! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getUserId(username: string): UUID | null {
    this.logger.debug(`Getting user ID for user: "${username}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const GET_USER_ID_SQL = "SELECT user_id AS userId FROM users WHERE username = @username LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_ID_SQL).get({ username: username }) as { userId: UUID } | undefined;
    return RESULT === undefined ? null : RESULT.userId;
  }

  public getSecuredUserPassword(userId: UUID): ISecuredPassword | null {
    this.logger.debug(`Getting secured password for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const GET_SECURED_USER_PASSWORD_SALT_SQL =
      "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_SECURED_USER_PASSWORD_SALT_SQL).get({ userId: userId }) as
      | { passwordHash: string; passwordSalt: string }
      | undefined;
    return RESULT === undefined ? null : { hash: RESULT.passwordHash, salt: RESULT.passwordSalt };
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const USER_COUNT_SQL = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(USER_COUNT_SQL).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  public isUserDataStorageIdAvailable(storageId: UUID): boolean {
    this.logger.debug(`Checking if User Data Storage ID "${storageId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const IS_USER_DATA_STORAGE_STORAGE_ID_AVAILABLE_SQL = `SELECT COUNT(*) AS count FROM user_data_storage_configs WHERE storage_id = @storageId`;
    const RESULT = this.db.prepare(IS_USER_DATA_STORAGE_STORAGE_ID_AVAILABLE_SQL).get({ storageId: storageId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Storage ID "${storageId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Storage ID "${storageId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Storages with same ID "${storageId}"`);
  }

  public addUserDataStorageConfigToUser(userId: UUID, securedUserDataStorageConfig: ISecuredUserDataStorageConfig): boolean {
    // TODO: Config should be encrypted blob
    this.logger.debug(`Adding new User Data Storage Config to user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // Validate config
    this.logger.debug("Validating User Data Storage Config.");
    if (!this.SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION(securedUserDataStorageConfig)) {
      this.logger.debug("Invalid User Data Storage Config.");
      this.logger.error("Validation errors:");
      this.SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
        this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
      });
      return false;
    }
    const STRINGIFIED_USER_DATA_STORAGE_CONFIG: string = JSON.stringify(securedUserDataStorageConfig.backendConfig, null, 2);
    // Validate stringified config as JSON at SQLite level
    if (!this.isJSONValidInSQLite(STRINGIFIED_USER_DATA_STORAGE_CONFIG, "User Data Storage Config")) {
      this.logger.error("User Data Storage Config invalid as SQLite JSON. Cannot add to user account.");
      return false;
    }
    this.logger.debug("Valid User Data Storage Config. Attempting to add to database.");
    const ADD_USER_DATA_STORAGE_CONFIG_SQL = `
    INSERT INTO user_data_storage_configs (
      storage_id, user_id, name, description, visibility_password_hash, visibility_password_salt, config
    ) VALUES (
      @storageId, @userId, @name, @description, @visibilityPasswordHash, @visibilityPasswordSalt, jsonb(@config)
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_DATA_STORAGE_CONFIG_SQL).run({
        storageId: securedUserDataStorageConfig.storageId,
        userId: userId,
        name: securedUserDataStorageConfig.name,
        description: securedUserDataStorageConfig.description ?? null,
        visibilityPasswordHash: securedUserDataStorageConfig.securedVisibilityPassword?.hash ?? null,
        visibilityPasswordSalt: securedUserDataStorageConfig.securedVisibilityPassword?.salt ?? null,
        config: STRINGIFIED_USER_DATA_STORAGE_CONFIG
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not add User Data Storage Config! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[] {
    this.logger.debug(`Getting all User Data Storage Configs for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // TODO: Config should be encrypted blob
    const GET_ALL_SECURED_USER_DATA_STORAGE_CONFIGS_SQL = `
    SELECT
      storage_id AS storageId,
      name,
      description,
      visibility_password_hash AS visibilityPasswordHash,
      visibility_password_salt AS visibilityPasswordSalt,
      json(config) AS config
    FROM user_data_storage_configs WHERE user_id = @userId`;
    const RESULT = this.db.prepare(GET_ALL_SECURED_USER_DATA_STORAGE_CONFIGS_SQL).all({ userId: userId }) as IRawSecuredUserDataStorageConfig[];
    this.logger.warn(JSON.stringify(RESULT, null, 2));
    const SECURED_USER_DATA_STORAGE_CONFIGS: ISecuredUserDataStorageConfig[] = [];
    try {
      RESULT.map((rawSecuredUserDataStorageConfig: IRawSecuredUserDataStorageConfig) => {
        this.logger.debug("Determining visibility password.");
        // TODO: Make this a separate function
        const SECURED_VISIBILITY_PASSWORD: ISecuredPassword | null =
          rawSecuredUserDataStorageConfig.visibilityPasswordHash !== null && rawSecuredUserDataStorageConfig.visibilityPasswordSalt !== null
            ? {
                hash: rawSecuredUserDataStorageConfig.visibilityPasswordHash,
                salt: rawSecuredUserDataStorageConfig.visibilityPasswordSalt
              }
            : null;
        this.logger.silly(SECURED_VISIBILITY_PASSWORD !== null ? "Config has visibility password." : "Config does not have visibility password.");
        this.logger.debug("Parsing User Data Storage Config.");
        const PARSED_USER_DATA_STORAGE_BACKEND_CONFIG: UserDataStorageBackendConfig = JSON.parse(
          rawSecuredUserDataStorageConfig.config
        ) as UserDataStorageBackendConfig;
        this.logger.debug("Validating parsed User Data Storage Config.");
        if (!this.SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION(PARSED_USER_DATA_STORAGE_BACKEND_CONFIG)) {
          this.logger.debug("Invalid User Data Storage Config.");
          this.logger.error("Validation errors:");
          this.SECURED_USER_DATA_STORAGE_CONFIG_VALIDATE_FUNCTION.errors?.map((error) => {
            this.logger.error(`Path: "${error.instancePath.length > 0 ? error.instancePath : "-"}", Message: "${error.message ?? "-"}".`);
          });
          return;
        }
        this.logger.debug("Valid User Data Storage Config.");
        SECURED_USER_DATA_STORAGE_CONFIGS.push({
          storageId: rawSecuredUserDataStorageConfig.storageId,
          name: rawSecuredUserDataStorageConfig.name,
          description: rawSecuredUserDataStorageConfig.description,
          securedVisibilityPassword: SECURED_VISIBILITY_PASSWORD,
          backendConfig: PARSED_USER_DATA_STORAGE_BACKEND_CONFIG
        });
      });
      return SECURED_USER_DATA_STORAGE_CONFIGS;
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      this.logger.error(`Could not parse results! ${ERROR_MESSAGE}!`);
      return [];
    }
  }

  private createUsersTable(): void {
    this.logger.debug('Creating "users" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SELECT_USERS_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
    const DOES_USERS_TABLE_EXIST: boolean = this.db.prepare(SELECT_USERS_TABLE_SQL).get() !== undefined;
    if (DOES_USERS_TABLE_EXIST) {
      this.logger.debug('Found "users" table.');
    } else {
      this.logger.debug('Did not find "users" table.');
      const CREATE_USERS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_USERS_TABLE_SQL).run();
      this.logger.debug('Created "users" table.');
    }
  }

  private createUserDataStorageConfigsTable(): void {
    this.logger.debug('Creating "user_data_storage_configs" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SELECT_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_configs'";
    const DOES_USER_DATA_STORAGE_CONFIGS_TABLE_EXIST: boolean = this.db.prepare(SELECT_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).get() !== undefined;
    if (DOES_USER_DATA_STORAGE_CONFIGS_TABLE_EXIST) {
      this.logger.debug('Found "user_data_storage_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_configs" table.');
      // TODO: Config should be encrypted blob
      const CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configs (
        storage_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        visibility_password_hash TEXT,
        visibility_password_salt TEXT,
        config BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_configs" table.');
    }
  }
}
