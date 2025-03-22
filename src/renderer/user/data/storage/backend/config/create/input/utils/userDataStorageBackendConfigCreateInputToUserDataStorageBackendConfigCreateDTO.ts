import { ILocalSQLiteUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigCreateInput";
import { IOptionBUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/optionB/optionBUserDataStorageBackendConfigCreateInput";
import { IOptionCUserDataStorageBackendConfigCreateInput } from "@renderer/user/data/storage/backend/implementations/optionC/optionCUserDataStorageBackendConfigCreateInput";
import {
  IUserDataStorageBackendConfigCreateInputMap,
  UserDataStorageBackendConfigCreateInput
} from "@renderer/user/data/storage/backend/config/create/input/UserDataStorageBackendConfigCreateInput";
import { ILocalSQLiteUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigCreateDTO";
import { IOptionBUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfigCreateDTO } from "@shared/user/data/storage/backend/config/create/DTO/implementations/optionC/optionC";
import {
  IUserDataStorageBackendConfigCreateDTOMap,
  UserDataStorageBackendConfigCreateDTO
} from "@shared/user/data/storage/backend/config/create/DTO/UserDataStorageBackendConfigCreateDTO";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { LogFunctions } from "electron-log";

type UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTOFunctionMap = {
  [K in UserDataStorageBackendType]: (
    userDataStorageBackendConfigCreateInput: IUserDataStorageBackendConfigCreateInputMap[K]
  ) => IUserDataStorageBackendConfigCreateDTOMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP: UserDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTOFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: (
      userDataStorageBackendConfigCreateInput: ILocalSQLiteUserDataStorageBackendConfigCreateInput
    ): ILocalSQLiteUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput satisfies ILocalSQLiteUserDataStorageBackendConfigCreateDTO;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: (
      userDataStorageBackendConfigCreateInput: IOptionBUserDataStorageBackendConfigCreateInput
    ): IOptionBUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput satisfies IOptionBUserDataStorageBackendConfigCreateDTO;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: (
      userDataStorageBackendConfigCreateInput: IOptionCUserDataStorageBackendConfigCreateInput
    ): IOptionCUserDataStorageBackendConfigCreateDTO => {
      return userDataStorageBackendConfigCreateInput satisfies IOptionCUserDataStorageBackendConfigCreateDTO;
    }
  };

export const userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTO = (
  userDataStorageBackendConfigCreateInput: UserDataStorageBackendConfigCreateInput,
  logger: LogFunctions | null
): UserDataStorageBackendConfigCreateDTO => {
  logger?.debug(
    `Converting "${userDataStorageBackendConfigCreateInput.type}" User Data Storage Backend Config Create Input to User Data Storage Backend Config Create DTO.`
  );
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.9)
  switch (userDataStorageBackendConfigCreateInput.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
        userDataStorageBackendConfigCreateInput.type
      ](userDataStorageBackendConfigCreateInput);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
        userDataStorageBackendConfigCreateInput.type
      ](userDataStorageBackendConfigCreateInput);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_TO_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_FUNCTION_MAP[
        userDataStorageBackendConfigCreateInput.type
      ](userDataStorageBackendConfigCreateInput);
    default:
      throw new Error(`Invalid User Data Storage Backend Config type "${(userDataStorageBackendConfigCreateInput as { type: string }).type}"`);
  }
};
