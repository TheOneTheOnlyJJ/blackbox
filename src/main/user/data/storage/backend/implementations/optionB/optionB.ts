import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import { BaseUserDataStorageBackend } from "../../BaseUserDataStorageBackend";
import { LogFunctions } from "electron-log";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["OptionB"];
  optionB: string;
}

export class OptionBUserDataStorageBackend extends BaseUserDataStorageBackend<IOptionBUserDataStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfig> = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionB],
        default: USER_DATA_STORAGE_BACKEND_TYPES.OptionB,
        ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
      },
      optionB: {
        type: "string",
        ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
      }
    },
    required: ["type", "optionB"],
    additionalProperties: false
  } as const;

  public constructor(config: IOptionBUserDataStorageBackendConfig, logger: LogFunctions) {
    super(config, OptionBUserDataStorageBackend.CONFIG_JSON_SCHEMA, logger);
  }

  public isOpen(): boolean {
    return false;
  }

  public isClosed(): boolean {
    return true;
  }

  public open(): boolean {
    throw new Error("Cannot open Option B User Account Storage as it is mock");
  }

  public close(): boolean {
    throw new Error("Cannot close Option B User Account Storage as it is mock");
  }

  public isLocal(): boolean {
    return true;
  }
}
