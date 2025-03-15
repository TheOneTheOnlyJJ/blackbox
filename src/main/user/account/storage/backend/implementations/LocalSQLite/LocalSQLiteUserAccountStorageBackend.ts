import { BaseUserAccountStorageBackend } from "../../BaseUserAccountStorageBackend";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { LogFunctions } from "electron-log";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { JSONSchemaType } from "ajv";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendTypes } from "../../UserAccountStorageBackendType";
import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";
import { UUID } from "crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";
import { IBaseUserAccountStorageBackendConfig } from "../../config/BaseUserAccountStorageBackendConfig";
import {
  IStorageSecuredUserDataStorageConfig,
  isStorageSecuredUserDataStorageConfigValid
} from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import {
  isStorageSecuredUserDataStorageVisibilityGroupValid,
  IStorageSecuredUserDataStorageVisibilityGroup
} from "@main/user/data/storage/visibilityGroup/StorageSecuredUserDataStorageVisibilityGroup";

export interface ILocalSQLiteUserAccountStorageBackendConfig extends IBaseUserAccountStorageBackendConfig {
  type: UserAccountStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

// TODO: Move these to utils dir
type SQLiteJournalModePragmaResult = undefined | null | string;
type SQLiteForeignKeysPragmaResult = undefined | null | 0 | 1;

interface ISQLiteVersion {
  version: string;
}

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
  logger?.debug("Converting Raw Storage Secured User Data Storage Visibility Group to Storage Secured User Data Storage Visibility Group.");
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

interface IRawStorageSecuredUserDataStorageVisibilityGroup {
  visibilityGroupId: UUID;
  userDataStorageVisibilityGroupIV: Buffer;
  userDataStorageVisibilityGroupData: Buffer;
}

const rawStorageSecuredUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup = (
  rawStorageSecuredUserDataStorageVisibilityGroup: IRawStorageSecuredUserDataStorageVisibilityGroup,
  userId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageVisibilityGroup => {
  logger?.debug("Converting Raw Storage Secured User Data Storage Visibility Group to Storage Secured User Data Storage Visibility Group.");
  return {
    visibilityGroupId: rawStorageSecuredUserDataStorageVisibilityGroup.visibilityGroupId,
    userId: userId,
    encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup: {
      data: rawStorageSecuredUserDataStorageVisibilityGroup.userDataStorageVisibilityGroupData,
      iv: rawStorageSecuredUserDataStorageVisibilityGroup.userDataStorageVisibilityGroupIV
    }
  } satisfies IStorageSecuredUserDataStorageVisibilityGroup;
};

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

  public constructor(config: ILocalSQLiteUserAccountStorageBackendConfig, logger: LogFunctions) {
    super(config, LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA, logger);
    this.db = null;
  }

  public getTypeTitle(): string {
    return LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type.title;
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
      this.logger.warn(`Already opened "${this.config.type}" User Account Storage Backend. No-op.`);
      return true;
    }
    try {
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
      this.createUserDataStorageVisibilityGroupsTable();
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
      this.logger.warn(`Already closed "${this.config.type}" User Account Storage Backend. No-op.`);
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

  // TODO: Delete comment
  // private isJSONValidInSQLite(json: object | string, jsonPurposeToLog: string): boolean {
  //   if (typeof json === "object") {
  //     json = JSON.stringify(json, null, 2);
  //   }
  //   this.logger.log(`Performing SQLite JSON validation on ${jsonPurposeToLog}.`);
  //   if (this.db === null) {
  //     throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
  //   }
  //   const IS_JSON_VALID_SQL = "SELECT json_valid(@json) AS isValid";
  //   const RESULT = this.db.prepare(IS_JSON_VALID_SQL).get({ json: json }) as { isValid: 0 | 1 };
  //   const IS_VALID: boolean = RESULT.isValid === 0 ? false : true;
  //   this.logger.debug(`JSON validity in SQLite: ${IS_VALID.toString()}.`);
  //   return IS_VALID;
  // }

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
      user_id, username, password_hash, password_salt, data_encryption_aes_key_salt
    ) VALUES (
      @userId, @username, @passwordHash, @passwordSalt, @dataEncryptionAESKeySalt
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(ADD_USER_SQL).run({
        userId: securedUserSignInPayload.userId,
        username: securedUserSignInPayload.username,
        passwordHash: securedUserSignInPayload.securedPassword.hash,
        passwordSalt: securedUserSignInPayload.securedPassword.salt,
        dataEncryptionAESKeySalt: securedUserSignInPayload.dataEncryptionAESKeySalt
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

  public getUserDataEncryptionAESKeySalt(userId: UUID): string | null {
    this.logger.debug(`Getting user data encryption AES key salt for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const GET_USER_DATA_ENCRYPTION_KEY_SALT_SQL =
      "SELECT data_encryption_aes_key_salt AS dataEncryptionAESKeySalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(GET_USER_DATA_ENCRYPTION_KEY_SALT_SQL).get({ userId: userId }) as { dataEncryptionAESKeySalt: string } | undefined;
    return RESULT === undefined ? null : RESULT.dataEncryptionAESKeySalt;
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

  public getStorageSecuredUserDataStorageConfigs(options: {
    userId: UUID;
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
    visibilityGroups: {
      includeIds: (UUID | null)[] | "all";
      excludeIds: UUID[] | null;
    };
  }): IStorageSecuredUserDataStorageConfig[] {
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
    throw new Error(`Found multiple (${RESULT.count.toString()}) User Data Storage Visibility Groups with same ID "${dataStorageVisibilityGroupId}"`);
  }

  public addStorageSecuredUserDataStorageVisibilityGroup(
    storageSecuredUserDataStorageVisibilityGroup: IStorageSecuredUserDataStorageVisibilityGroup
  ): boolean {
    this.logger.debug(
      `Adding new Storage Secured User Data Storage Visibility Group to user with ID: "${storageSecuredUserDataStorageVisibilityGroup.userId}".`
    );
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    // Validate visibility group
    this.logger.debug("Validating Storage Secured User Data Storage Visibility Group.");
    if (!isStorageSecuredUserDataStorageVisibilityGroupValid(storageSecuredUserDataStorageVisibilityGroup)) {
      this.logger.debug("Invalid Storage Secured User Data Storage Visibility Group.");
      return false;
    }
    const SQL_QUERY = `
    INSERT INTO user_data_storage_visibility_groups (
      visibility_group_id, user_id, user_data_storage_visibility_group_iv, user_data_storage_visibility_group_data
    ) VALUES (
      @visibilityGroupId, @userId, @userDataStorageVisibilityGroupIV, @userDataStorageVisibilityGroupData
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
        visibilityGroupId: storageSecuredUserDataStorageVisibilityGroup.visibilityGroupId,
        userId: storageSecuredUserDataStorageVisibilityGroup.userId,
        userDataStorageVisibilityGroupIV: Buffer.from(
          storageSecuredUserDataStorageVisibilityGroup.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup.iv
        ),
        userDataStorageVisibilityGroupData: Buffer.from(
          storageSecuredUserDataStorageVisibilityGroup.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup.data
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

  public getStorageSecuredUserDataStorageVisibilityGroups(options: {
    userId: UUID;
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
  }): IStorageSecuredUserDataStorageVisibilityGroup[] {
    const { userId, includeIds, excludeIds } = options;
    // TODO: Improve logging
    this.logger.debug(`Getting Storage Secured User Data Storage Visibility Groups for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    let SQLQuery = `
      SELECT
        visibility_group_id AS visibilityGroupId,
        user_data_storage_visibility_group_iv AS userDataStorageVisibilityGroupIV,
        user_data_storage_visibility_group_data AS userDataStorageVisibilityGroupData
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
    const RESULTS: IRawStorageSecuredUserDataStorageVisibilityGroup[] = this.db
      .prepare(SQLQuery)
      .all(Object.fromEntries(SQL_QUERY_ARGUMENTS.entries())) as IRawStorageSecuredUserDataStorageVisibilityGroup[];
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS: IStorageSecuredUserDataStorageVisibilityGroup[] = RESULTS.map(
      (
        rawStorageSecuredUserDataStorageVisibilityGroup: IRawStorageSecuredUserDataStorageVisibilityGroup,
        idx: number
      ): IStorageSecuredUserDataStorageVisibilityGroup => {
        const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: IStorageSecuredUserDataStorageVisibilityGroup =
          rawStorageSecuredUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup(
            rawStorageSecuredUserDataStorageVisibilityGroup,
            userId,
            null
          );
        if (!isStorageSecuredUserDataStorageVisibilityGroupValid(STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP)) {
          throw new Error(`Invalid Storage Secured User Data Storage Visibility Group at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP;
      }
    );
    this.logger.debug(
      `Returning ${STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length.toString()} Storage Secured User Data Storage Visibility Group${
        STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length === 1 ? "" : "s"
      }.`
    );
    return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUPS;
  }

  public getStorageSecuredUserDataStorageVisibilityGroupForConfigId(
    userId: UUID,
    userDataStorageConfigId: UUID
  ): IStorageSecuredUserDataStorageVisibilityGroup | null {
    this.logger.debug(`Getting Storage Secured User Data Storage Visibility Group for User Data Storage Config "${userDataStorageConfigId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = `
      SELECT
        v.visibility_group_id AS visibilityGroupId,
        v.user_data_storage_visibility_group_iv AS userDataStorageVisibilityGroupIV,
        v.user_data_storage_visibility_group_data AS userDataStorageVisibilityGroupData
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
      | IRawStorageSecuredUserDataStorageVisibilityGroup
      | undefined;
    if (RESULT === undefined) {
      this.logger.silly(`User Data Storage "${userDataStorageConfigId}" has no User Data Storage Visibility Group.`);
      return null;
    }
    this.logger.silly(`User Data Storage "${userDataStorageConfigId}" has User Data Storage Visibility Group "${RESULT.visibilityGroupId}".`);
    return rawStorageSecuredUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup(RESULT, userId, null);
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
        data_encryption_aes_key_salt TEXT NOT NULL
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

  private createUserDataStorageVisibilityGroupsTable(): void {
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
