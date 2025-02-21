import { IUserDataStorageBackendConfigMap, UserDataStorageBackendConfig } from "./UserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { IOptionBUserDataStorageBackendConfig } from "../implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfig } from "../implementations/optionC/optionC";
import { ILocalSQLiteUserDataStorageBackendConfig } from "../implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import {
  IUserDataStorageBackendConfigCreateDTOMap,
  UserDataStorageBackendConfigCreateDTO
} from "@shared/user/data/storage/backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { ILocalSQLiteUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigCreateDTO";
import { IOptionBUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/optionC/optionC";

type UserDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfigFunctionMap = {
  [K in UserDataStorageBackendType]: (
    userDataStorageBackendConfigCreateDTO: IUserDataStorageBackendConfigCreateDTOMap[K] // TODO: Give function dynamic argument name?
  ) => IUserDataStorageBackendConfigMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP: UserDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfigFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: (
      userDataStorageBackendConfigCreateDTO: ILocalSQLiteUserDataStorageBackendConfigCreateDTO
    ): ILocalSQLiteUserDataStorageBackendConfig => {
      return userDataStorageBackendConfigCreateDTO;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: (
      userDataStorageBackendConfigCreateDTO: IOptionBUserDataStorageBackendConfigCreateDTO
    ): IOptionBUserDataStorageBackendConfig => {
      return userDataStorageBackendConfigCreateDTO;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: (
      userDataStorageBackendConfigCreateDTO: IOptionCUserDataStorageBackendConfigCreateDTO
    ): IOptionCUserDataStorageBackendConfig => {
      return userDataStorageBackendConfigCreateDTO;
    }
  };

export const userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig = (
  userDataStorageBackendConfigCreateDTO: UserDataStorageBackendConfigCreateDTO,
  logger: LogFunctions
): UserDataStorageBackendConfig => {
  logger.debug(
    `Converting ${userDataStorageBackendConfigCreateDTO.type} User Data Storage Backend Config Create DTO to User Data Storage Backend Config.`
  );
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.8)
  // This is all this function should really be:
  // return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
  //   userDataStorageConfigInputData
  // );
  let CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG: UserDataStorageBackendConfig;
  switch (userDataStorageBackendConfigCreateDTO.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
          userDataStorageBackendConfigCreateDTO
        );
      break;
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
          userDataStorageBackendConfigCreateDTO
        );
      break;
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageBackendConfigCreateDTO.type](
          userDataStorageBackendConfigCreateDTO
        );
      break;
  }
  logger.debug(
    `Done converting ${userDataStorageBackendConfigCreateDTO.type} User Data Storage Backend Config Create DTO to User Data Storage Backend Config.`
  );
  return CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG;
};
