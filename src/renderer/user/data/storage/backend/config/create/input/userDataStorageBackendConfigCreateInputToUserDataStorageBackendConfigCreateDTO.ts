import { ILocalSQLiteUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigCreateInput";
import { IOptionBUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/optionB/optionBUserDataStorageBackendConfigCreateInput";
import { IOptionCUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/optionC/optionCUserDataStorageBackendConfigCreateInput";
import {
  IUserDataStorageBackendConfigCreateInputMap,
  UserDataStorageBackendConfigCreateInput
} from "@renderer/user/data/storage/backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { ILocalSQLiteUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigCreateDTO";
import { IOptionBUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/implementations/optionC/optionC";
import {
  IUserDataStorageBackendConfigCreateDTOMap,
  UserDataStorageBackendConfigCreateDTO
} from "@shared/user/data/storage/backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { LogFunctions } from "electron-log";

type UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTOFunctionMap = {
  [K in UserDataStorageBackendType]: (
    userDataStorageBackendConfigCreateInput: IUserDataStorageBackendConfigCreateInputMap[K] // TODO: Give function dynamic argument name?
  ) => IUserDataStorageBackendConfigCreateDTOMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP: UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTOFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: (
      userDataStorageBackendConfigCreateInput: ILocalSQLiteUserDataStorageBackendConfigCreateInput
    ): ILocalSQLiteUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: (
      userDataStorageBackendConfigCreateInput: IOptionBUserDataStorageBackendConfigCreateInput
    ): IOptionBUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: (
      userDataStorageBackendConfigCreateInput: IOptionCUserDataStorageBackendConfigCreateInput
    ): IOptionCUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput;
    }
  };

export const userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTO = (
  userDataStorageBackendConfigCreateInput: UserDataStorageBackendConfigCreateInput,
  logger: LogFunctions
): UserDataStorageBackendConfigCreateDTO => {
  logger.debug(
    `Converting ${userDataStorageBackendConfigCreateInput.type} User Data Storage Backend Config Create Input to User Data Storage Backend Config Create DTO.`
  );
  let CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO: UserDataStorageBackendConfigCreateDTO;
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.8)
  switch (userDataStorageBackendConfigCreateInput.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
          userDataStorageBackendConfigCreateInput.type
        ](userDataStorageBackendConfigCreateInput);
      break;
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
          userDataStorageBackendConfigCreateInput.type
        ](userDataStorageBackendConfigCreateInput);
      break;
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO =
        USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
          userDataStorageBackendConfigCreateInput.type
        ](userDataStorageBackendConfigCreateInput);
      break;
  }
  logger.debug(
    `Done converting ${userDataStorageBackendConfigCreateInput.type} User Data Storage Backend Config Create Input to User Data Storage Backend Config Create DTO.`
  );
  return CONVERTED_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO;
};
