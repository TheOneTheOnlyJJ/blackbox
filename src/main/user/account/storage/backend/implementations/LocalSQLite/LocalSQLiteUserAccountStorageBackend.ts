import {
  BaseUserAccountStorageBackend,
  IUserAccountStorageUserDataStorageConfigFilter,
  IUserAccountStorageUserDataStorageVisibilityGroupFilter,
  IUserAccountStorageBackendHandlers
} from "../../BaseUserAccountStorageBackend";
import DatabaseConstructor, { Database, RunResult } from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { JSONSchemaType, ValidateFunction } from "ajv";
import {
  USER_ACCOUNT_STORAGE_BACKEND_TYPES,
  UserAccountStorageBackendTypes
} from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { ISecuredUserSignUpPayload } from "@main/user/account/SecuredUserSignUpPayload";
import { UUID } from "crypto";
import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserAccountStorageBackendConstants";
import {
  BASE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS,
  IBaseUserAccountStorageBackendConfig
} from "../../config/BaseUserAccountStorageBackendConfig";
import {
  IStorageSecuredUserDataStorageConfig,
  isStorageSecuredUserDataStorageConfigValid
} from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import {
  isValidStorageSecuredUserDataStorageVisibilityGroupConfig,
  IStorageSecuredUserDataStorageVisibilityGroupConfig
} from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { getSQLiteVersion } from "@main/utils/SQLite/getSQLiteVersion";
import { getSQLiteJournalModePragmaResult } from "@main/utils/SQLite/getSQLiteJournalModePragmaResult";
import { getSQLiteForeignKeysPragmaResult } from "@main/utils/SQLite/getSQLiteForeignKeysPragmaResult";
import {
  IRawStorageSecuredUserDataStorageConfig,
  rawStorageSecuredUserDataStorageConfigToStorageSecuredUserDataStorageConfig
} from "./utils/RawStorageSecuredUserDataStorageConfig";
import {
  IRawStorageSecuredUserDataStorageVisibilityGroupConfig,
  rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig
} from "./utils/RawStorageSecuredUserDataStorageVisibilityGroupConfig";
import { ILocalSQLiteUserAccountStorageBackendInfo } from "@shared/user/account/storage/backend/info/implementations/localSQLite/LocalSQLiteUserAccountStorageBackendInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface ILocalSQLiteUserAccountStorageBackendConfig extends IBaseUserAccountStorageBackendConfig {
  type: UserAccountStorageBackendTypes["localSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export class LocalSQLiteUserAccountStorageBackend extends BaseUserAccountStorageBackend<ILocalSQLiteUserAccountStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserAccountStorageBackendConfig> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite],
        ...BASE_USER_ACCOUNT_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type
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
  public static readonly isValidLocalSQLiteUserAccountStorageBackendConfig: ValidateFunction<ILocalSQLiteUserAccountStorageBackendConfig> =
    AJV.compile<ILocalSQLiteUserAccountStorageBackendConfig>(LocalSQLiteUserAccountStorageBackend.CONFIG_JSON_SCHEMA);

  private db: Database | null;

  public constructor(config: ILocalSQLiteUserAccountStorageBackendConfig, logScope: string, handlers: IUserAccountStorageBackendHandlers) {
    if (
      !BaseUserAccountStorageBackend.isValidConfig<ILocalSQLiteUserAccountStorageBackendConfig>(
        config,
        LocalSQLiteUserAccountStorageBackend.isValidLocalSQLiteUserAccountStorageBackendConfig
      )
    ) {
      throw new Error(`Invalid "${USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite}" User Account Storage Backend Config`);
    }
    const INITIAL_INFO: ILocalSQLiteUserAccountStorageBackendInfo = {
      type: config.type,
      dbDirPath: config.dbDirPath,
      dbFileName: config.dbFileName,
      isOpen: false,
      isLocal: true
    };
    super(config, INITIAL_INFO, logScope, handlers);
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
      this.logger.warn(`Already opened "${this.config.type}" User Account Storage Backend. No-op.`);
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
      this.updateInfo({ ...this.getInfo(), isOpen: true });
      this.onOpened?.();
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
      this.updateInfo({ ...this.getInfo(), isOpen: false });
      this.onClosed?.();
      return true;
    } catch (error: unknown) {
      const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not close "${this.config.type}" User Acount Storage Backend: ${ERROR_MESSAGE}!`);
      return false;
    }
  }

  public isUserIdAvailable(userId: UUID): boolean {
    this.logger.debug(`Checking if user ID "${userId}" is available.`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = `SELECT COUNT(*) AS count FROM users WHERE user_id = @userId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ userId: userId }) as { count: number };
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
    const SQL_QUERY = "SELECT COUNT(*) AS count FROM users WHERE username = @username";
    const RESULT = this.db.prepare(SQL_QUERY).get({ username: username }) as { count: number };
    if (RESULT.count === 0) {
      this.logger.debug(`Available username "${username}".`);
      return true;
    } else if (RESULT.count === 1) {
      this.logger.debug(`Unavailable username "${username}".`);
      return false;
    }
    throw new Error(`Found multiple (${RESULT.count.toString()}) users with same username "${username}"`);
  }

  public addUser(securedUserSignInPayload: ISecuredUserSignUpPayload): boolean {
    this.logger.debug(`Adding user: "${securedUserSignInPayload.username}" with ID: "${securedUserSignInPayload.userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = `
    INSERT INTO users (
      user_id, username, password_hash, password_salt, data_aes_key_salt
    ) VALUES (
      @userId, @username, @passwordHash, @passwordSalt, @dataAESKeySalt
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
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
    const SQL_QUERY = "SELECT user_id AS userId FROM users WHERE username = @username LIMIT 1";
    const RESULT = this.db.prepare(SQL_QUERY).get({ username: username }) as { userId: UUID } | undefined;
    return RESULT === undefined ? null : RESULT.userId;
  }

  public getSecuredUserPassword(userId: UUID): ISecuredPassword | null {
    this.logger.debug(`Getting secured password for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = "SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(SQL_QUERY).get({ userId: userId }) as { passwordHash: string; passwordSalt: string } | undefined;
    return RESULT === undefined ? null : { hash: RESULT.passwordHash, salt: RESULT.passwordSalt };
  }

  public getUserDataAESKeySalt(userId: UUID): string | null {
    this.logger.debug(`Getting user data AES key salt for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = "SELECT data_aes_key_salt AS dataAESKeySalt FROM users WHERE user_id = @userId LIMIT 1";
    const RESULT = this.db.prepare(SQL_QUERY).get({ userId: userId }) as { dataAESKeySalt: string } | undefined;
    return RESULT === undefined ? null : RESULT.dataAESKeySalt;
  }

  public getUserCount(): number {
    this.logger.debug("Getting user count.");
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = "SELECT COUNT(*) AS count FROM users";
    const RESULT = this.db.prepare(SQL_QUERY).get() as { count: number };
    this.logger.debug(`User count: ${RESULT.count.toString()}.`);
    return RESULT.count;
  }

  public getUsernameForUserId(userId: UUID): string | null {
    this.logger.debug(`Getting username for user ID "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const SQL_QUERY = "SELECT username FROM users WHERE user_id = @userId";
    const RESULT = this.db.prepare(SQL_QUERY).get({ userId: userId }) as { username: string } | undefined;
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
    const SQL_QUERY = `SELECT COUNT(*) AS count FROM user_data_storage_configs WHERE storage_id = @storageId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ storageId: storageId }) as { count: number };
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
    const SQL_QUERY = `
    INSERT INTO user_data_storage_configs (
      storage_id, user_id, visibility_group_id, user_data_storage_config_iv, user_data_storage_config_data
    ) VALUES (
      @storageId, @userId, @visibilityGroupId, @userDataStorageConfigIV, @userDataStorageConfigData
    )`;
    try {
      const RUN_RESULT: RunResult = this.db.prepare(SQL_QUERY).run({
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

  public getStorageSecuredUserDataStorageConfigs(filter: IUserAccountStorageUserDataStorageConfigFilter): IStorageSecuredUserDataStorageConfig[] {
    this.logger.debug(`Getting Storage Secured User Data Storage Configs for user: "${filter.userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const { userId, includeIds, excludeIds, visibilityGroups } = filter;
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
    const SQL_QUERY_ARGUMENTS: Map<string, string> = new Map<string, string>([["userId", userId]]);
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
    const SQL_QUERY = `
    SELECT
      COUNT(*) AS count
    FROM user_data_storage_visibility_group_configs WHERE visibility_group_id = @visibilityGroupId`;
    const RESULT = this.db.prepare(SQL_QUERY).get({ visibilityGroupId: dataStorageVisibilityGroupId }) as { count: number };
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
    if (!isValidStorageSecuredUserDataStorageVisibilityGroupConfig(storageSecuredUserDataStorageVisibilityGroupConfig)) {
      this.logger.debug("Invalid Storage Secured User Data Storage Visibility Group Config.");
      return false;
    }
    const SQL_QUERY = `
    INSERT INTO user_data_storage_visibility_group_configs (
      visibility_group_id, user_id, user_data_storage_visibility_group_config_iv, user_data_storage_visibility_group_config_data
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
    filter: IUserAccountStorageUserDataStorageVisibilityGroupFilter
  ): IStorageSecuredUserDataStorageVisibilityGroupConfig[] {
    const { userId, includeIds, excludeIds } = filter;
    this.logger.debug(`Getting Storage Secured User Data Storage Visibility Group Configs for user: "${userId}".`);
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    let SQLQuery = `
      SELECT
        visibility_group_id AS visibilityGroupId,
        user_data_storage_visibility_group_config_iv AS userDataStorageVisibilityGroupConfigIV,
        user_data_storage_visibility_group_config_data AS userDataStorageVisibilityGroupConfigData
      FROM
        user_data_storage_visibility_group_configs
      WHERE
        user_id = @userId
    `;
    const SQL_QUERY_ARGUMENTS: Map<string, string> = new Map<string, string>([["userId", userId]]);
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
        const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG: IStorageSecuredUserDataStorageVisibilityGroupConfig =
          rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig(
            rawStorageSecuredUserDataStorageVisibilityGroupConfig,
            userId,
            null
          );
        if (!isValidStorageSecuredUserDataStorageVisibilityGroupConfig(STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG)) {
          throw new Error(`Invalid Storage Secured User Data Storage Visibility Group Config at index: ${idx.toString()}`);
        }
        return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG;
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
        v.user_data_storage_visibility_group_config_iv AS userDataStorageVisibilityGroupConfigIV,
        v.user_data_storage_visibility_group_config_data AS userDataStorageVisibilityGroupConfigData
      FROM
        user_data_storage_configs c
      JOIN
        user_data_storage_visibility_group_configs v
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
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "users" table.');
    } else {
      this.logger.debug('Did not find "users" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        data_aes_key_salt TEXT NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "users" table.');
    }
  }

  private createUserDataStorageConfigsTable(): void {
    this.logger.debug('Creating "user_data_storage_configs" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_configs'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "user_data_storage_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_configs" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS user_data_storage_configs (
        storage_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        visibility_group_id TEXT REFERENCES user_data_storage_visibility_group_configs(visibility_group_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_storage_config_iv BLOB NOT NULL,
        user_data_storage_config_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "user_data_storage_configs" table.');
    }
  }

  private createUserDataStorageVisibilityGroupConfigsTable(): void {
    this.logger.debug('Creating "user_data_storage_visibility_group_configs" table.');
    if (this.db === null) {
      throw new Error(`Closed "${this.config.type}" User Account Storage Backend`);
    }
    const DOES_EXIST_SQL_QUERY = "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data_storage_visibility_group_configs'";
    const DOES_EXIST: boolean = this.db.prepare(DOES_EXIST_SQL_QUERY).get() !== undefined;
    if (DOES_EXIST) {
      this.logger.debug('Found "user_data_storage_visibility_group_configs" table.');
    } else {
      this.logger.debug('Did not find "user_data_storage_visibility_group_configs" table.');
      const CREATE_SQL_QUERY = `
      CREATE TABLE IF NOT EXISTS user_data_storage_visibility_group_configs (
        visibility_group_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        user_data_storage_visibility_group_config_iv BLOB NOT NULL,
        user_data_storage_visibility_group_config_data BLOB NOT NULL
      )
      `;
      this.db.prepare(CREATE_SQL_QUERY).run();
      this.logger.debug('Created "user_data_storage_visibility_group_configs" table.');
    }
  }
}
