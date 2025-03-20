import { BaseUserAccountStorageBackend, IDataStorageConfigFilter, IDataStorageVisibilityGroupFilter } from "../../BaseUserAccountStorageBackend";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendTypes } from "../../UserAccountStorageBackendType";
import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";
import { UUID } from "crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/constants/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";
import { IBaseUserAccountStorageBackendConfig } from "../../config/BaseUserAccountStorageBackendConfig";
import {
  IStorageSecuredUserDataStorageConfig,
  isStorageSecuredUserDataStorageConfigValid
} from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import {
  isStorageSecuredUserDataStorageVisibilityGroupConfigValid,
  IStorageSecuredUserDataStorageVisibilityGroupConfig
} from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { getSQLiteVersion } from "@main/utils/SQLite/getSQLiteVersion";
import { getSQLiteJournalModePragmaResult } from "@main/utils/SQLite/getSQLiteJournalModePragmaResult";
import { getSQLiteForeignKeysPragmaResult } from "@main/utils/SQLite/getSQLiteForeignKeysPragmaResult";

export interface ILocalSQLiteUserAccountStorageBackendConfig extends IBaseUserAccountStorageBackendConfig {
  type: UserAccountStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

// TODO: Move these to utils dir

interface IRawStorageSecuredUserDataStorageConfig {
  storageId: UUID;
  visibilityGroupId: UUID;
  userDataStorageConfigIV: Buffer;
  userDataStorageConfigData: Buffer;
}

const rawStorageSecuredUserDataStorageConfigToStorageSecuredUserDataStorageConfig = (
  rawStorageSecuredUserDataStorageConfig: IRawStorageSecuredUserDataStorageConfig,
  userId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageConfig => {
  logger?.debug("Converting Raw Storage Secured User Data Config to Storage Secured User Data Storage Config.");
  return {
    storageId: rawStorageSecuredUserDataStorageConfig.storageId,
    userId: userId,
    visibilityGroupId: rawStorageSecuredUserDataStorageConfig.visibilityGroupId,
    encryptedPrivateStorageSecuredUserDataStorageConfig: {
      data: rawStorageSecuredUserDataStorageConfig.userDataStorageConfigData,
      iv: rawStorageSecuredUserDataStorageConfig.userDataStorageConfigIV
    }
  } satisfies IStorageSecuredUserDataStorageConfig;
};

interface IRawStorageSecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userDataStorageVisibilityGroupConfigIV: Buffer;
  userDataStorageVisibilityGroupConfigData: Buffer;
}

const rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig = (
  rawStorageSecuredUserDataStorageVisibilityGroupConfig: IRawStorageSecuredUserDataStorageVisibilityGroupConfig,
  userId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug(
    "Converting Raw Storage Secured User Data Storage Visibility Group Config to Storage Secured User Data Storage Visibility Group Config."
  );
  return {
    visibilityGroupId: rawStorageSecuredUserDataStorageVisibilityGroupConfig.visibilityGroupId,
    userId: userId,
    encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: {
      data: rawStorageSecuredUserDataStorageVisibilityGroupConfig.userDataStorageVisibilityGroupConfigData,
      iv: rawStorageSecuredUserDataStorageVisibilityGroupConfig.userDataStorageVisibilityGroupConfigIV
    }
  } satisfies IStorageSecuredUserDataStorageVisibilityGroupConfig;
};

export class LocalSQLiteUserAccountStorageBackend extends BaseUserAccountStorageBackend<ILocalSQLiteUserAccountStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite],
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;

  private db: Database | null;

  public constructor(config: ILocalSQLiteUserAccountStorageBackendConfig, logScope: string) {
    super(config, LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA, logScope);
    this.db = null;
  }

  public isOpen(): boolean {
    return this.db !== null;
  }

  public isClosed(): boolean {
    return this.db === null;
  }

  public open(): boolean {
    this.logger.info(`Opening "${this.config.type}" User Account Storage Backend.`);
    if (this.isOpen()) {
      this.logger.warn(`Already opened "${this.config.type}" User Account Storage Backend.`);
      return true;
    }
    try {
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
      // SQLite version
      this.logger.debug(`SQLite version: ${getSQLiteVersion(this.db)}.`);
      // Journal mode
      this.db.pragma("journal_mode = WAL");
      this.logger.debug(`Journal mode: "${getSQLiteJournalModePragmaResult(this.db)}".`);
      // Foreign keys
      this.db.pragma("foreign_keys = ON");
      const ARE_FOREIGN_KEYS_ENABLED: boolean = getSQLiteForeignKeysPragmaResult(this.db);
      this.logger.debug(`Foreign keys: ${ARE_FOREIGN_KEYS_ENABLED.toString()}.`);
      if (!ARE_FOREIGN_KEYS_ENABLED) {
        throw new Error("Could not enable foreign keys");
      }
      // Create tables
      this.createUsersTable();
      this.createUserDataStorageConfigsTable();
      this.createUserDataStorageVisibilityGroupConfigsTable();
      this.logger.info(`Opened "${this.config.type}" User Acount Storage Backend.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not open "${this.config.type}" User Acount Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public close(): boolean {
    this.logger.info(`Closing "${this.config.type}" User Account Storage Backend.`);
    if (this.db === null) {
      // TODO: Remove all "No-op"s from logs?
      this.logger.warn(`Already closed "${this.config.type}" User Account Storage Backend.`);
      return true;
    }
    try {
      this.db.close();
      this.db = null;
      this.logger.info(`Closed "${this.config.type}" User Account Storage Backend.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not close "${this.config.type}" User Acount Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public isLocal(): boolean {
    return true;
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
    const ADD_USER_SQL = `
    INSERT INTO users (
      user_id, username, password_hash, password_salt, data_aes_key_salt
    ) VALUES (
      @userId, @username, @passwordHash, @passwordSalt, @dataAESKeySalt
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_SQL).run({
        userId: securedUserSignInPayload.userId,
        username: securedUserSignInPayload.username,
        passwordHash: securedUserSignInPayload.securedPassword.hash,
        passwordSalt: securedUserSignInPayload.securedPassword.salt,
        dataAESKeySalt: securedUserSignInPayload.dataAESKeySalt
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
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

  public getUserDataAESKeySalt(userId: UUID): string | null {
    this.logger.debug(`Getting user data AES key salt for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const GET_USER_DATA_KEY_SALT_SQL = "SELECT data_aes_key_salt AS dataAESKeySalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_DATA_KEY_SALT_SQL).get({ userId: userId }) as { dataAESKeySalt: string } | undefined;
    return RESULT === undefined ? null : RESULT.dataAESKeySalt;
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

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const GET_USERNAME_FOR_USER_ID_SQL = "SELECT username FROM users WHERE user_id = @userId";
    const RESULT = this.db.prepare(GET_USERNAME_FOR_USER_ID_SQL).get({ userId: userId }) as { username: string } | undefined;
    if (RESULT === undefined) {
      this.logger.silly(`User with ID "${userId}" has no username (does not exist).`);
      return null;
    }
    this.logger.silly(`User with ID "${userId}" has username "${RESULT.username}".`);
    return RESULT.username;
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

  public addStorageSecuredUserDataStorageConfig(storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig): boolean {
    this.logger.debug(`Adding new Storage Secured User Data Storage Config to user with ID: "${storageSecuredUserDataStorageConfig.userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // Validate config
    this.logger.debug("Validating Storage Secured User Data Storage Config.");
    if (!isStorageSecuredUserDataStorageConfigValid(storageSecuredUserDataStorageConfig)) {
      this.logger.debug("Invalid Storage Secured User Data Storage Config.");
      return false;
    }
    const ADD_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_SQL = `
    INSERT INTO user_data_storage_configs (
      storage_id, user_id, visibility_group_id, user_data_storage_config_iv, user_data_storage_config_data
    ) VALUES (
      @storageId, @userId, @visibilityGroupId, @userDataStorageConfigIV, @userDataStorageConfigData
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG_SQL).run({
        storageId: storageSecuredUserDataStorageConfig.storageId,
        userId: storageSecuredUserDataStorageConfig.userId,
        visibilityGroupId: storageSecuredUserDataStorageConfig.visibilityGroupId,
        userDataStorageConfigIV: Buffer.from(storageSecuredUserDataStorageConfig.encryptedPrivateStorageSecuredUserDataStorageConfig.iv),
        userDataStorageConfigData: Buffer.from(storageSecuredUserDataStorageConfig.encryptedPrivateStorageSecuredUserDataStorageConfig.data)
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not add Storage Secured User Data Storage Config! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getStorageSecuredUserDataStorageConfigs(options: IDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    const { userId, includeIds, excludeIds, visibilityGroups } = options;
    this.logger.debug(`Getting Storage Secured User Data Storage Configs for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // TODO: Improve logging
    let SQLQuery = `
      SELECT
        storage_id AS storageId,
        visibility_group_id AS visibilityGroupId,
        user_data_storage_config_iv AS userDataStorageConfigIV,
        user_data_storage_config_data AS userDataStorageConfigData
      FROM
        user_data_storage_configs
      WHERE
        user_id = @userId
      `;
    const SQL_QUERY_ARGUMENTS: Map<string, unknown> = new Map<string, unknown>([["userId", userId]]);
    if (includeIds !== "all") {
      if (includeIds.length === 0) {
        throw new Error("Include IDs list cannot be empty");
      }
      SQLQuery += " AND storage_id IN (SELECT value FROM json_each(@includeIdsString))";
      SQL_QUERY_ARGUMENTS.set("includeIdsString", JSON.stringify(includeIds));
    }
    if (excludeIds !== null) {
      if (excludeIds.length === 0) {
        throw new Error("Exclude IDs list cannot be empty");
      }
      SQLQuery += " AND storage_id NOT IN (SELECT value FROM json_each(@excludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("excludeIdsString", JSON.stringify(excludeIds));
    }
    // Visibility groups
    if (visibilityGroups.includeIds !== "all") {
      if (visibilityGroups.includeIds.length === 0) {
        throw new Error("Visibility groups include IDs list cannot be empty");
      }
      if (visibilityGroups.includeIds.includes(null)) {
        SQLQuery += " AND (visibility_group_id IS NULL OR visibility_group_id IN (SELECT value FROM json_each(@visibilityGroupsIncludeIdsString)))";
        SQL_QUERY_ARGUMENTS.set(
          "visibilityGroupsIncludeIdsString",
          JSON.stringify(
            visibilityGroups.includeIds.filter((includeId: UUID | null): boolean => {
              return includeId !== null;
            })
          )
        );
      } else {
        SQLQuery += " AND visibility_group_id IN (SELECT value FROM json_each(@visibilityGroupsIncludeIdsString))";
        SQL_QUERY_ARGUMENTS.set("visibilityGroupsIncludeIdsString", JSON.stringify(visibilityGroups.includeIds));
      }
    }
    if (visibilityGroups.excludeIds !== null) {
      if (visibilityGroups.excludeIds.length === 0) {
        throw new Error("Visibility groups exclude IDs list cannot be empty");
      }
      SQLQuery += " AND visibility_group_id NOT IN (SELECT value FROM json_each(@visibilityGroupsExcludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("visibilityGroupsExcludeIdsString", JSON.stringify(visibilityGroups.excludeIds));
    }
    const RESULTS: IRawStorageSecuredUserDataStorageConfig[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataStorageConfig[];
    const STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS: IStorageSecuredUserDataStorageConfig[] = RESULTS.map(
      (rawStorageSecuredUserDataStorageConfig: IRawStorageSecuredUserDataStorageConfig, idx: number): IStorageSecuredUserDataStorageConfig => {
        const STORAGE_SECURED_USER_DATA_STORAGE_CONFIG: IStorageSecuredUserDataStorageConfig =
          rawStorageSecuredUserDataStorageConfigToStorageSecuredUserDataStorageConfig(rawStorageSecuredUserDataStorageConfig, userId, null);
        if (!isStorageSecuredUserDataStorageConfigValid(STORAGE_SECURED_USER_DATA_STORAGE_CONFIG)) {
          throw new Error(`Invalid Storage Secured User Data Storage Config at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_STORAGE_CONFIG;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.length.toString()} Storage Secured User Data Storage Config${
        STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS.length === 1 ? "" : "s"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_STORAGE_CONFIGS;
  }

  public isUserDataStorageVisibilityGroupIdAvailable(dataStorageVisibilityGroupId: UUID): boolean {
    this.logger.debug(`Checking if User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const IS_USER_DATA_STORAGE_STORAGE_VISIBILITY_GROUP_ID_AVAILABLE_SQL = `
    SELECT
      COUNT(*) AS count
    FROM user_data_storage_visibility_groups WHERE visibility_group_id = @visibilityGroupId`;
    const RESULT = this.db
      .prepare(IS_USER_DATA_STORAGE_STORAGE_VISIBILITY_GROUP_ID_AVAILABLE_SQL)
      .get({ visibilityGroupId: dataStorageVisibilityGroupId }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" is available.`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`User Data Storage Visibility Group ID "${dataStorageVisibilityGroupId}" is not available.`);
      return false;
    }
    throw new Error(
      `Found multiple (${RESULT.count.toString()}) User Data Storage Visibility Group Configs with same ID "${dataStorageVisibilityGroupId}"`
    );
  }

  public addStorageSecuredUserDataStorageVisibilityGroupConfig(
    storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
  ): boolean {
    this.logger.debug(
      `Adding new Storage Secured User Data Storage Visibility Group Config to user with ID: "${storageSecuredUserDataStorageVisibilityGroupConfig.userId}".`
    );
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // Validate visibility group
    this.logger.debug("Validating Storage Secured User Data Storage Visibility Group Config.");
    if (!isStorageSecuredUserDataStorageVisibilityGroupConfigValid(storageSecuredUserDataStorageVisibilityGroupConfig)) {
      this.logger.debug("Invalid Storage Secured User Data Storage Visibility Group Config.");
      return false;
    }
    const SQL_QUERY = `
    INSERT INTO user_data_storage_visibility_groups (
      visibility_group_id, user_id, user_data_storage_visibility_group_iv, user_data_storage_visibility_group_data
    ) VALUES (
      @visibilityGroupId, @userId, @userDataStorageVisibilityGroupConfigIV, @userDataStorageVisibilityGroupConfigData
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
        visibilityGroupId: storageSecuredUserDataStorageVisibilityGroupConfig.visibilityGroupId,
        userId: storageSecuredUserDataStorageVisibilityGroupConfig.userId,
        userDataStorageVisibilityGroupConfigIV: Buffer.from(
          storageSecuredUserDataStorageVisibilityGroupConfig.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig.iv
        ),
        userDataStorageVisibilityGroupConfigData: Buffer.from(
          storageSecuredUserDataStorageVisibilityGroupConfig.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig.data
        )
      });
      this.logger.silly(`Number of changes: ${RUN_RESULT.changes.toString()}. Last inserted row ID: ${RUN_RESULT.lastInsertRowid.toString()}.`);
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not add Storage Secured User Data Storage Visibility Group! ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigs(
    options: IDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    const { userId, includeIds, excludeIds } = options;
    // TODO: Improve logging
    this.logger.debug(`Getting Storage Secured User Data Storage Visibility Group Configs for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    let SQLQuery = `
      SELECT
        visibility_group_id AS visibilityGroupId,
        user_data_storage_visibility_group_iv AS userDataStorageVisibilityGroupConfigIV,
        user_data_storage_visibility_group_data AS userDataStorageVisibilityGroupConfigData
      FROM
        user_data_storage_visibility_groups
      WHERE
        user_id = @userId
    `;
    const SQL_QUERY_ARGUMENTS: Map<string, unknown> = new Map<string, unknown>([["userId", userId]]);
    if (includeIds !== "all") {
      if (includeIds.length === 0) {
        throw new Error("Include IDs list cannot be empty");
      }
      SQLQuery += " AND visibility_group_id IN (SELECT value FROM json_each(@includeIdsString))";
      SQL_QUERY_ARGUMENTS.set("includeIdsString", JSON.stringify(includeIds));
    }
    if (excludeIds !== null) {
      if (excludeIds.length === 0) {
        throw new Error("Exclude IDs list cannot be empty");
      }
      SQLQuery += " AND visibility_group_id NOT IN (SELECT value FROM json_each(@excludeIdsString))";
      SQL_QUERY_ARGUMENTS.set("excludeIdsString", JSON.stringify(excludeIds));
    }
    const RESULTS: IRawStorageSecuredUserDataStorageVisibilityGroupConfig[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataStorageVisibilityGroupConfig[];
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS: IStorageSecuredUserDataStorageVisibilityGroupConfig[] = RESULTS.map(
      (
        rawStorageSecuredUserDataStorageVisibilityGroupConfig: IRawStorageSecuredUserDataStorageVisibilityGroupConfig,
        idx: number
      ): IStorageSecuredUserDataStorageVisibilityGroupConfig => {
        const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: IStorageSecuredUserDataStorageVisibilityGroupConfig =
          rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig(
            rawStorageSecuredUserDataStorageVisibilityGroupConfig,
            userId,
            null
          );
        if (!isStorageSecuredUserDataStorageVisibilityGroupConfigValid(STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP)) {
          throw new Error(`Invalid Storage Secured User Data Storage Visibility Group Config at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS.length.toString()} Storage Secured User Data Storage Visibility Group Config${
        STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS.length === 1 ? "" : "s"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS;
  }

  public getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig | null {
    this.logger.debug(`Getting Storage Secured User Data Storage Visibility Group Config for User Data Storage Config "${userDataStorageConfigId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = `
      SELECT
        v.visibility_group_id AS visibilityGroupId,
        v.user_data_storage_visibility_group_iv AS userDataStorageVisibilityGroupConfigIV,
        v.user_data_storage_visibility_group_data AS userDataStorageVisibilityGroupConfigData
      FROM
        user_data_storage_configs c
      JOIN
        user_data_storage_visibility_groups v
      ON
        c.visibility_group_id = v.visibility_group_id
      WHERE
        c.user_id = @userId
      AND
        c.storage_id = @userDataStorageConfigId
    `;
    const RESULT = this.db.prepare(SQL_QUERY).get({ userId: userId, userDataStorageConfigId: userDataStorageConfigId }) as
      | IRawStorageSecuredUserDataStorageVisibilityGroupConfig
      | undefined;
    if (RESULT === undefined) {
      this.logger.silly(`User Data Storage "${userDataStorageConfigId}" has no User Data Storage Visibility Group Config.`);
      return null;
    }
    this.logger.silly(`User Data Storage "${userDataStorageConfigId}" has User Data Storage Visibility Group Config "${RESULT.visibilityGroupId}".`);
    return rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig(RESULT, userId, null);
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
        password_salt TEXT NOT NULL,
        data_aes_key_salt TEXT NOT NULL
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
      const CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configs (
        storage_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        visibility_group_id TEXT REFERENCES user_data_storage_visibility_groups(visibility_group_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_storage_config_iv BLOB NOT NULL,
        user_data_storage_config_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USER_DATA_STORAGE_CONFIGS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_configs" table.');
    }
  }

  private createUserDataStorageVisibilityGroupConfigsTable(): void {
    // TODO: Rename table and members
    this.logger.debug('Creating "user_data_storage_visibility_groups" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SELECT_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_SQL =
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_visibility_groups'";
    const DOES_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_EXIST: boolean =
      this.db.prepare(SELECT_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_SQL).get() !== undefined;
    if (DOES_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_EXIST) {
      this.logger.debug('Found "user_data_storage_visibility_groups" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_visibility_groups" table.');
      const CREATE_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_SQL = `
      CREATE TABLE IF NOT EXISTS user_data_storage_visibility_groups (
        visibility_group_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_storage_visibility_group_iv BLOB NOT NULL,
        user_data_storage_visibility_group_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_USER_DATA_STORAGE_VISIBILITY_GROUPS_TABLE_SQL).run();
      this.logger.debug('Created "user_data_storage_visibility_groups" table.');
    }
  }
}
