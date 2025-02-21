import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageConfig } from "./UserDataStorageConfig";
import { UUID } from "node:crypto";
import { userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig } from "../backend/config/userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";

export function userDataStorageConfigCreateDTOToUserDataStorageConfig(
  configId: UUID,
  userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO,
  logger: LogFunctions
): IUserDataStorageConfig {
  logger.debug(`Converting User Data Storage Config Create DTO to User Data Storage Config.`);
  const CONVERTED_USER_DATA_STORAGE_CONFIG: IUserDataStorageConfig = {
    configId: configId,
    userId: userDataStorageConfigCreateDTO.userId as UUID,
    name: userDataStorageConfigCreateDTO.name,
    visibilityPassword: userDataStorageConfigCreateDTO.visibilityPassword,
    backendConfig: userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig(userDataStorageConfigCreateDTO.backendConfigCreateDTO, logger)
  };
  logger.debug(`Done converting User Data Storage Config Create DTO to User Data Storage Config.`);
  return CONVERTED_USER_DATA_STORAGE_CONFIG;
}
