import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { randomBytes, UUID } from "node:crypto";
import { IUserDataStorageVisibilityGroupConfig } from "../UserDataStorageVisibilityGroupConfig";

export const userDataStorageVisibilityGroupConfigCreateDTOToUserDataStorageVisibilityGroupConfig = (
  userDataStorageVisibilityGroupConfigCreateDTO: IUserDataStorageVisibilityGroupConfigCreateDTO,
  visibilityGroupId: UUID,
  AESKeySaltLength: number,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupConfig => {
  logger?.debug("Converting User Data Storage Visibility Group Config Create DTO to User Data Storage Visibility Group Config.");
  const AESKeySalt: Buffer = randomBytes(AESKeySaltLength);
  return {
    visibilityGroupId: visibilityGroupId,
    userId: userDataStorageVisibilityGroupConfigCreateDTO.userId as UUID,
    name: userDataStorageVisibilityGroupConfigCreateDTO.name,
    password: userDataStorageVisibilityGroupConfigCreateDTO.password,
    description: userDataStorageVisibilityGroupConfigCreateDTO.description,
    AESKeySalt: AESKeySalt.toString("base64")
  } satisfies IUserDataStorageVisibilityGroupConfig;
};
