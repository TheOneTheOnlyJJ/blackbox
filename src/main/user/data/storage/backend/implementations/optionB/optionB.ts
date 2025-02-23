import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import Ajv, { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import { BaseUserDataStorageBackend } from "../../BaseUserDataStorageBackend";
import { LogFunctions } from "electron-log";

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
        default: USER_DATA_STORAGE_BACKEND_TYPES.OptionB
      },
      optionB: {
        type: "string",
        minLength: 1
      }
    },
    required: ["type", "optionB"],
    additionalProperties: false
  } as const;

  public constructor(config: IOptionBUserDataStorageBackendConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, OptionBUserDataStorageBackend.CONFIG_JSON_SCHEMA, logger, ajv);
    throw new Error("Option B User Account Storage is only a mock");
  }
}
