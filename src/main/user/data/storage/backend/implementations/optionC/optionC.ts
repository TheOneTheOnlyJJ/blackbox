import Ajv, { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import { BaseUserDataStorageBackend } from "../../BaseUserDataStorageBackend";
import { LogFunctions } from "electron-log";

export interface IOptionCUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["OptionC"];
  optionC: string;
}

export class OptionCUserDataStorageBackend extends BaseUserDataStorageBackend<IOptionCUserDataStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfig> = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionC],
        default: USER_DATA_STORAGE_BACKEND_TYPES.OptionC
      },
      optionC: {
        type: "string",
        minLength: 10
      }
    },
    required: ["type", "optionC"],
    additionalProperties: false
  } as const;

  public constructor(config: IOptionCUserDataStorageBackendConfig, logger: LogFunctions, ajv: Ajv) {
    super(config, OptionCUserDataStorageBackend.CONFIG_JSON_SCHEMA, logger, ajv);
    throw new Error("Option C User Account Storage is only a mock");
  }
}
