import { JSONSchemaType, ValidateFunction } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IBaseUserDataStorageBackendConfig } from "../../config/BaseUserDataStorageBackendConfig";
import { BaseUserDataStorageBackend, IUserDataStorageBackendHandlers } from "../../BaseUserDataStorageBackend";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionC/OptionCUserDataStorageBackendConstants";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { IOptionCUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionC/OptionCUserDataStorageBackendInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/BaseUserDataStorageBackendConstants";
import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import { IStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import { IStorageSecuredUserDataEntry } from "@main/user/data/entry/StorageSecuredUserDataEntry";

export interface IOptionCUserDataStorageBackendConfig extends IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendTypes["optionC"];
  optionC: string;
}

export class OptionCUserDataStorageBackend extends BaseUserDataStorageBackend<IOptionCUserDataStorageBackendConfig> {
  public static readonly CONFIG_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfig> = {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionC],
        default: USER_DATA_STORAGE_BACKEND_TYPES.optionC,
        ...BASE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
      },
      optionC: {
        type: "string",
        ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC
      }
    },
    required: ["type", "optionC"],
    additionalProperties: false
  } as const;
  public static readonly isValidOptionCUserDataStorageBackendConfig: ValidateFunction<IOptionCUserDataStorageBackendConfig> =
    AJV.compile<IOptionCUserDataStorageBackendConfig>(OptionCUserDataStorageBackend.CONFIG_JSON_SCHEMA);

  public constructor(config: IOptionCUserDataStorageBackendConfig, logScope: string, handlers: IUserDataStorageBackendHandlers) {
    if (
      !BaseUserDataStorageBackend.isValidConfig<IOptionCUserDataStorageBackendConfig>(
        config,
        OptionCUserDataStorageBackend.isValidOptionCUserDataStorageBackendConfig
      )
    ) {
      throw new Error(`Invalid "${USER_DATA_STORAGE_BACKEND_TYPES.optionC}" User Data Storage Backend Config`);
    }
    const INITIAL_INFO: IOptionCUserDataStorageBackendInfo = {
      type: config.type,
      optionC: config.optionC,
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
    throw new Error("Cannot open Option C User Data Storage as it is mock");
  }

  public close(): boolean {
    throw new Error("Cannot close Option C User Data Storage as it is mock");
  }

  public isLocal(): boolean {
    return false;
  }

  public isUserDataBoxIdAvailable(): boolean {
    throw new Error("Cannot get User Data Box ID availability from Option C User Data Storage as it is a mock");
  }

  public isUserDataTemplateIdAvailable(): boolean {
    throw new Error("Cannot get User Data Template ID availability from Option C User Data Storage as it is a mock");
  }

  public isUserDataEntryIdAvailable(): boolean {
    throw new Error("Cannot get User Data Entry ID availability from Option C User Data Storage as it is a mock");
  }

  public addStorageSecuredUserDataBoxConfig(): boolean {
    throw new Error("Cannot add Storage Secured User Data Box Config to Option C User Data Storage as it is a mock");
  }

  public addStorageSecuredUserDataTemplateConfig(): boolean {
    throw new Error("Cannot add Storage Secured User Data Template Config to Option C User Data Storage as it is a mock");
  }

  public addStorageSecuredUserDataEntry(): boolean {
    throw new Error("Cannot add Storage Secured User Data Entry to Option C User Data Storage as it is a mock");
  }

  public getStorageSecuredUserDataBoxConfigs(): IStorageSecuredUserDataBoxConfig[] {
    throw new Error("Cannot get Storage Secured User Data Box Configs from Option C User Data Storage as it is a mock");
  }

  public getStorageSecuredUserDataTemplateConfigs(): IStorageSecuredUserDataTemplateConfig[] {
    throw new Error("Cannot get Storage Secured User Data Template Configs from Option C User Data Storage as it is a mock");
  }

  public getStorageSecuredUserDataEntries(): IStorageSecuredUserDataEntry[] {
    throw new Error("Cannot get Storage Secured User Data Entries from Option C User Data Storage as it is a mock");
  }
}
