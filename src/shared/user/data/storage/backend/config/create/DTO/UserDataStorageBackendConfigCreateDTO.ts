import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "../../../UserDataStorageBackendType";
import {
  ILocalSQLiteUserDataStorageBackendConfigCreateDTO,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigCreateDTO";
import {
  IOptionBUserDataStorageBackendConfigCreateDTO,
  OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/optionB/optionB";
import {
  IOptionCUserDataStorageBackendConfigCreateDTO,
  OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
} from "./implementations/optionC/optionC";

export interface IUserDataStorageBackendConfigCreateDTOMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserDataStorageBackendConfigCreateDTO;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: IOptionBUserDataStorageBackendConfigCreateDTO;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: IOptionCUserDataStorageBackendConfigCreateDTO;
}
export type UserDataStorageBackendConfigCreateDTO = IUserDataStorageBackendConfigCreateDTOMap[keyof IUserDataStorageBackendConfigCreateDTOMap];

type UserDataStorageBackendConfigCreateDTOJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigCreateDTOMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP: UserDataStorageBackendConfigCreateDTOJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfigCreateDTO> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfigCreateDTO>[]>(
      (
        accumulator: JSONSchemaType<UserDataStorageBackendConfigCreateDTO>[],
        currentValue: string
      ): JSONSchemaType<UserDataStorageBackendConfigCreateDTO>[] => {
        accumulator.push(
          USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA_MAP[currentValue as keyof UserDataStorageBackendConfigCreateDTOJSONSchemaMap]
        );
        return accumulator;
      },
      []
    )
} as const;
