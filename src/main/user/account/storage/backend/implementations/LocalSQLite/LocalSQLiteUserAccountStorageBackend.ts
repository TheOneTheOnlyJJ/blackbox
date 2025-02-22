import { UserAccountStorageBackend } from "../../UserAccountStorageBackend";
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
import { ISecuredPasswordData } from "@main/utils/encryption/SecuredPasswordData";
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
  configId: UUID;
  name: string;
  visibilityPasswordHash: string | null;
  visibilityPasswordSalt: string | null;
  config: string;
}

export class LocalSQLiteUserAccountStorageBackend extends UserAccountStorageBackend<ILocalSQLiteUserAccountStorageBackendConfig> {
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

  private isJSONValidInSQLite(json: object | string, jsonPurposeToLog: string): boolean {
    if (typeof json === "object") {
      json = JSON.stringify(json, null, 2);
    }
    this.logger.log(`Performing SQLite JSON validation on ${jsonPurposeToLog}.`);
    const IS_JSON_VALID_SQL = "SELECT json_valid(@json) AS isValid";
    const RESULT = this.db.prepare(IS_JSON_VALID_SQL).get({ json: json }) as { isValid: 0 | 1 };
    const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
    this.logger.debug(`JSON validity in SQLite: "${IS_VALID.toString()}".`);
    return IS_VALID;
  }

  public isUserIdAvailable(userId: UUID): boolean {
    this.logger.debug(`Checking if user ID "${userId}" is available.`);
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

  public addUser(userData: ISecuredUserSignUpPayload): boolean {
    this.logger.debug(`Adding user: "${userData.username}".`);
    const ADD_USER_SQL =
      "INSERT INTO users (user_id, username, password_hash, password_salt) VALUES (@userId, @username, @passwordHash, @passwordSalt)";
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_SQL).run({
        userId: userData.userId,
        username: userData.username,
        passwordHash: userData.securedPassword.hash,
        passwordSalt: userData.securedPassword.salt
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

  public getSecuredUserPasswordData(userId: UUID): ISecuredPasswordData | null {
    this.logger.debug(`Getting secured password data for user: "${userId}".`);
    const GET_USER_PASSWORD_SALT_SQL =
      "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_PASSWORD_SALT_SQL).get({ userId: userId }) as { passwordHash: string; passwordSalt: string } | undefined;
    return RESULT === undefined ? null : { hash: RESULT.passwordHash, salt: RESULT.passwordSalt };
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    const USER_COUNT_SQL = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(USER_COUNT_SQL).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  public isUserDataStorageConfigIdAvailable(configId: UUID): boolean {
    this.logger.debug(`Checking if User Data Storage Config ID "${configId}" is available.`);
    const IS_USER_DATA_STORAGE_CONFIG_ID_AVAILABLE_SQL = `SELECT COUNT(*) AS count FROM user_data_storage_configs WHERE config_id = @configId`;
    const RESULT = this.db.prepare(IS_USER_DATA_STORAGE_CONFIG_ID_AVAILABLE_SQL).get({ configId: configId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Storage Config ID "${configId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Storage Config ID "${configId}" is not available.`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Storage Configs with same ID "${configId}"`);
  }

  public addUserDataStorageConfigToUser(userId: UUID, securedUserDataStorageConfig: ISecuredUserDataStorageConfig): boolean {
    // TODO: Rewrite so that it validates entire storage config, not just backend config
    // TODO: Config should be encrypted blob
    this.logger.debug(`Adding new User Data Storage Config to user: "${userId}".`);
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
      config_id, user_id, name, visibility_password_hash, visibility_password_salt, config
    ) VALUES (
      @configId, @userId, @name, @visibilityPasswordHash, @visibilityPasswordSalt, jsonb(@config)
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_DATA_STORAGE_CONFIG_SQL).run({
        configId: securedUserDataStorageConfig.configId,
        userId: userId,
        name: securedUserDataStorageConfig.name,
        visibilityPasswordHash: securedUserDataStorageConfig.securedVisibilityPassword?.hash ?? null,
        visibilityPasswordSalt: securedUserDataStorageConfig.securedVisibilityPassword?.salt ?? null,
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

  public getAllUserDataStorageConfigs(userId: UUID): ISecuredUserDataStorageConfig[] {
    // TODO: Check this
    this.logger.debug(`Getting all User Data Storage Configs for user: "${userId}".`);
    // TODO: Config should be encrypted blob
    const GET_ALL_SECURED_USER_DATA_STORAGE_CONFIGS_SQL = `
    SELECT
      config_id AS configId,
      name,
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
        const SECURED_VISIBILITY_PASSWORD: ISecuredPasswordData | undefined =
          rawSecuredUserDataStorageConfig.visibilityPasswordHash !== null && rawSecuredUserDataStorageConfig.visibilityPasswordSalt !== null
            ? {
                hash: rawSecuredUserDataStorageConfig.visibilityPasswordHash,
                salt: rawSecuredUserDataStorageConfig.visibilityPasswordSalt
              }
            : undefined;
        this.logger.silly(
          SECURED_VISIBILITY_PASSWORD !== undefined ? "Config has visibility password." : "Config does not have visibility password."
        );
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
          configId: rawSecuredUserDataStorageConfig.configId,
          name: rawSecuredUserDataStorageConfig.name,
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
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL
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
