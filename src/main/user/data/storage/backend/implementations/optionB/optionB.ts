import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import { BaseUserDataStorageBackend, IUserDataStorageBackendHandlers } from "../../BaseUserDataStorageBackend";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";
import { IOptionBUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionB/OptionBUserDataStorageBackendInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/BaseUserDataStorageBackendConstants";
import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";

export interface IOptionBUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["optionB"];
  optionB: string;
}

export class OptionBUserDataStorageBackend extends BaseUserDataStorageBackend<IOptionBUserDataStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfig> = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionB],
        default: USER_DATA_STORAGE_BACKEND_TYPES.optionB,
        ...BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
      },
      optionB: {
        type: "string",
        ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
      }
    },
    required: ["type", "optionB"],
    additionalProperties: false
  } as const;
  public static readonly isValidOptionBUserDataStorageBackendConfig: ValidateFunction<IOptionBUserDataStorageBackendConfig> =
    AJV.compile<IOptionBUserDataStorageBackendConfig>(OptionBUserDataStorageBackend.CONFIG_JSON_SCHEMA);

  public constructor(config: IOptionBUserDataStorageBackendConfig, logScope: string, handlers: IUserDataStorageBackendHandlers) {
    if (
      !BaseUserDataStorageBackend.isValidConfig<IOptionBUserDataStorageBackendConfig>(
        config,
        OptionBUserDataStorageBackend.isValidOptionBUserDataStorageBackendConfig
      )
    ) {
      throw new Error(`Invalid "${USER_DATA_STORAGE_BACKEND_TYPES.optionB}" User Data Storage Backend Config`);
    }
    const INITIAL_INFO: IOptionBUserDataStorageBackendInfo = {
      type: config.type,
      optionB: config.optionB,
      isOpen: false,
      isLocal: true
    };
    super(config, INITIAL_INFO, logScope, handlers);
  }

  public isOpen(): boolean {
    return false;
  }

  public isClosed(): boolean {
    return true;
  }

  public open(): boolean {
    throw new Error("Cannot open Option B User Data Storage as it is mock");
  }

  public close(): boolean {
    throw new Error("Cannot close Option B User Data Storage as it is mock");
  }

  public isLocal(): boolean {
    return true;
  }

  public isUserDataBoxIdAvailable(): boolean {
    throw new Error("Cannot get User Data Box ID availability from Option B User Data Storage as it is a mock");
  }

  public addStorageSecuredUserDataBoxConfig(): boolean {
    throw new Error("Cannot add Storage Secured User Data Box Config to Option B User Data Storage as it is a mock");
  }

  public getStorageSecuredUserDataBoxConfigs(): IStorageSecuredUserDataBoxConfig[] {
    throw new Error("Cannot get Storage Secured User Data Box Configs from Option B User Data Storage as it is a mock");
  }
}
