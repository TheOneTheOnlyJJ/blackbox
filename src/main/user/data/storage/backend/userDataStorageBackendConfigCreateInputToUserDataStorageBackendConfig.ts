import {
  IUserDataStorageBackendConfigCreateInputMap,
  UserDataStorageBackendConfigCreateInput
} from "@shared/user/data/storage/backend/createInput/UserDataStorageBackendConfigCreateInput";
import { IUserDataStorageBackendConfigMap, UserDataStorageBackendConfig } from "./UserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { ILocalSQLiteUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/LocalSQLiteUserDataStorageBackendConfigCreateInput";
import { IOptionBUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/optionB";
import { IOptionBUserDataStorageBackendConfig } from "./implementations/optionB";
import { IOptionCUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/optionC";
import { IOptionCUserDataStorageBackendConfig } from "./implementations/optionC";
import { ILocalSQLiteUserDataStorageBackendConfig } from "./implementations/LocalSQLiteUserDataStorageBackend";

type UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigFunctionMap = {
  [K in UserDataStorageBackendType]: (
    userDataStorageConfigInputData: IUserDataStorageBackendConfigCreateInputMap[K]
  ) => IUserDataStorageBackendConfigMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP: UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: (
      userDataStorageConfigInputData: ILocalSQLiteUserDataStorageBackendConfigCreateInput
    ): ILocalSQLiteUserDataStorageBackendConfig => {
      return userDataStorageConfigInputData;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: (
      userDataStorageConfigInputData: IOptionBUserDataStorageBackendConfigCreateInput
    ): IOptionBUserDataStorageBackendConfig => {
      return userDataStorageConfigInputData;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: (
      userDataStorageConfigInputData: IOptionCUserDataStorageBackendConfigCreateInput
    ): IOptionCUserDataStorageBackendConfig => {
      return userDataStorageConfigInputData;
    }
  };

// TODO: Make this accept a DTO as argument, not input
export const userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfig = (
  userDataStorageConfigInputData: UserDataStorageBackendConfigCreateInput,
  logger: LogFunctions
): UserDataStorageBackendConfig => {
  logger.debug(
    `Converting ${userDataStorageConfigInputData.type} User Data Storage Backend Config Create Input to User Data Storage Backend Config.`
  );
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.8)
  // This is all this function should really be:
  // return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
  //   userDataStorageConfigInputData
  // );
  switch (userDataStorageConfigInputData.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
  }
};
