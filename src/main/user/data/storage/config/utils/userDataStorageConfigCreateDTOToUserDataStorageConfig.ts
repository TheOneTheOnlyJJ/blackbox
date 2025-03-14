import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageConfig } from "../UserDataStorageConfig";
import { UUID } from "node:crypto";
import { userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig } from "../../backend/config/utils/userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig";
import { LogFunctions } from "electron-log";

export function userDataStorageConfigCreateDTOToUserDataStorageConfig(
  userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO,
  storageId: UUID,
  logger: LogFunctions | null
): IUserDataStorageConfig {
  logger?.debug("Converting User Data Storage Config Create DTO to User Data Storage Config.");
  return {
    storageId: storageId,
    userId: userDataStorageConfigCreateDTO.userId as UUID,
    visibilityGroupId: userDataStorageConfigCreateDTO.visibilityGroupId as UUID,
    name: userDataStorageConfigCreateDTO.name,
    description: userDataStorageConfigCreateDTO.description,
    backendConfig: userDataStorageBackendConfigCreateDTOToUserDataStorageBackendConfig(userDataStorageConfigCreateDTO.backendConfigCreateDTO, logger)
  };
}
