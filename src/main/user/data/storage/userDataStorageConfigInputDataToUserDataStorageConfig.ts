import {
  IUserDataStorageConfigInputDataMap,
  UserDataStorageConfigInputData
} from "@shared/user/data/storage/inputData/UserDataStorageConfigInputData";
import { IUserDataStorageConfigMap, UserDataStorageConfig } from "./UserDataStorageConfig";
import { LogFunctions } from "electron-log";
import { USER_DATA_STORAGE_TYPES, UserDataStorageType } from "@shared/user/data/storage/UserDataStorageType";
import { ILocalSQLiteUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/LocalSQLiteUserDataStorageConfigInputData";
import { IOptionBUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/optionB";
import { IOptionBUserDataStorageConfig } from "./implementations/optionB";
import { IOptionCUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/optionC";
import { IOptionCUserDataStorageConfig } from "./implementations/optionC";
import { ILocalSQLiteUserDataStorageConfig } from "./implementations/LocalSQLiteUserDataStorage";

type UserDataStorageConfigInputDataToUserDataStorageConfigFunctionMap = {
  [K in UserDataStorageType]: (userDataStorageConfigInputData: IUserDataStorageConfigInputDataMap[K]) => IUserDataStorageConfigMap[K];
};
const USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP: UserDataStorageConfigInputDataToUserDataStorageConfigFunctionMap =
  {
    [USER_DATA_STORAGE_TYPES.LocalSQLite]: (
      userDataStorageConfigInputData: ILocalSQLiteUserDataStorageConfigInputData
    ): ILocalSQLiteUserDataStorageConfig => {
      return userDataStorageConfigInputData;
    },
    [USER_DATA_STORAGE_TYPES.OptionB]: (userDataStorageConfigInputData: IOptionBUserDataStorageConfigInputData): IOptionBUserDataStorageConfig => {
      return userDataStorageConfigInputData;
    },
    [USER_DATA_STORAGE_TYPES.OptionC]: (userDataStorageConfigInputData: IOptionCUserDataStorageConfigInputData): IOptionCUserDataStorageConfig => {
      return userDataStorageConfigInputData;
    }
  };

export const userDataStorageConfigInputDataToUserDataStorageConfig = (
  userDataStorageConfigInputData: UserDataStorageConfigInputData,
  logger: LogFunctions
): UserDataStorageConfig => {
  logger.debug(`Converting ${userDataStorageConfigInputData.type} User Data Storage config input data to User Data Storage config.`);
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here
  // This is all this function should really be:
  // return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
  //   userDataStorageConfigInputData
  // );
  switch (userDataStorageConfigInputData.type) {
    case USER_DATA_STORAGE_TYPES.LocalSQLite:
      return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
    case USER_DATA_STORAGE_TYPES.OptionB:
      return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
    case USER_DATA_STORAGE_TYPES.OptionC:
      return USER_DATA_STORAGE_CONFIG_INPUT_DATA_TO_USER_DATA_STORAGE_CONFIG_FUNCTION_MAP[userDataStorageConfigInputData.type](
        userDataStorageConfigInputData
      );
  }
};
