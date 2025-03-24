import { IUserDataStorageBackendConfigMap, UserDataStorageBackendConfig } from "../UserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IOptionBUserDataStorageBackendConfig } from "../../implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfig } from "../../implementations/optionC/optionC";
import { ILocalSQLiteUserDataStorageBackendConfig } from "../../implementations/localSQLite/LocalSQLiteUserDataStorageBackend";
import {
  IUserDataStorageBackendConfigCreateDTOMap,
  UserDataStorageBackendConfigCreateDTO
} from "@shared/user/data/storage/backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { ILocalSQLiteUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigCreateDTO";
import { IOptionBUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/optionC/optionC";

type UserDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfigFunctionMap = {
  [K in UserDataStorageBackendType]: (
    userDataStorageBackendConfigCreateDTO: IUserDataStorageBackendConfigCreateDTOMap[K]
  ) => IUserDataStorageBackendConfigMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP: UserDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfigFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: (
      userDataStorageBackendConfigCreateDTO: ILocalSQLiteUserDataStorageBackendConfigCreateDTO
    ): ILocalSQLiteUserDataStorageBackendConfig => {
      return {
        ...userDataStorageBackendConfigCreateDTO,
        dbFileName: userDataStorageBackendConfigCreateDTO.dbFileName.endsWith(".sqlite")
          ? userDataStorageBackendConfigCreateDTO.dbFileName
          : `${userDataStorageBackendConfigCreateDTO.dbFileName}.sqlite`
      } satisfies ILocalSQLiteUserDataStorageBackendConfig;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: (
      userDataStorageBackendConfigCreateDTO: IOptionBUserDataStorageBackendConfigCreateDTO
    ): IOptionBUserDataStorageBackendConfig => {
      return userDataStorageBackendConfigCreateDTO satisfies IOptionBUserDataStorageBackendConfig;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: (
      userDataStorageBackendConfigCreateDTO: IOptionCUserDataStorageBackendConfigCreateDTO
    ): IOptionCUserDataStorageBackendConfig => {
      return userDataStorageBackendConfigCreateDTO satisfies IOptionCUserDataStorageBackendConfig;
    }
  };

export const userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig = (
  userDataStorageBackendConfigCreateDTO: UserDataStorageBackendConfigCreateDTO,
  logger: LogFunctions | null
): UserDataStorageBackendConfig => {
  logger?.debug(
    `Converting "${userDataStorageBackendConfigCreateDTO.type}" User Data Storage Backend Config Create DTO to User Data Storage Backend Config.`
  );
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.9)
  // This is all this function should really be:
  // return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
  //   userDataStorageBackendConfigCreateDTO
  // );
  switch (userDataStorageBackendConfigCreateDTO.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
        userDataStorageBackendConfigCreateDTO
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
        userDataStorageBackendConfigCreateDTO
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
        userDataStorageBackendConfigCreateDTO
      );
    default:
      throw new Error(`Invalid User Data Storage Backend Config type "${(userDataStorageBackendConfigCreateDTO as { type: string }).type}"`);
  }
};
