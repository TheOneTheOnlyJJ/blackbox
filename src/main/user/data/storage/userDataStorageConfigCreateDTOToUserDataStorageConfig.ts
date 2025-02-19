import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/UserDataStorageConfigCreateDTO";
import { IUserDataStorageConfig } from "./UserDataStorageConfig";
import { UUID } from "node:crypto";
import { userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfig } from "./backend/userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";

export function userDataStorageConfigCreateDTOToUserDataStorageConfig(
  configId: UUID,
  userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO,
  logger: LogFunctions
): IUserDataStorageConfig {
  return {
    configId: configId,
    userId: userDataStorageConfigCreateDTO.userId as UUID,
    name: userDataStorageConfigCreateDTO.name,
    visibilityPassword: userDataStorageConfigCreateDTO.visibilityPassword,
    backendConfig: userDataStorageBackendConfigCreateInputToUserDataStorageBackendConfig(
      userDataStorageConfigCreateDTO.backendConfigCreateDTO,
      logger
    )
  };
}
