import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTO } from "../../../../backend/config/create/input/utils/userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTO";
import { IUserDataStorageConfigCreateInput } from "@renderer/user/data/storage/config/create/input/UserDataStorageConfigCreateInput";
import { LogFunctions } from "electron-log";

export const userDataStorageConfigCreateInputToUserDataStorageConfigCreateDTO = (
  userIdToAddTo: string,
  userDataStorageConfigCreateInput: IUserDataStorageConfigCreateInput,
  logger: LogFunctions | null
): IUserDataStorageConfigCreateDTO => {
  logger?.debug(`Converting User Data Storage Config Create Input to User Data Storage Config Create DTO.`);
  return {
    userId: userIdToAddTo,
    name: userDataStorageConfigCreateInput.name,
    description: userDataStorageConfigCreateInput.description ?? null,
    visibilityPassword: userDataStorageConfigCreateInput.visibilityPassword ?? null,
    backendConfigCreateDTO: userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfigCreateDTO(
      userDataStorageConfigCreateInput.backendConfigCreateInput,
      logger
    )
  };
};
