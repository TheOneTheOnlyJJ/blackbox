import { IUserDataStorageVisibilityGroupCreateDTO } from "@shared/user/data/storage/visibilityGroup/create/DTO/UserDataStorageVisibilityGroupCreateDTO";
import { LogFunctions } from "electron-log";
import { randomBytes, UUID } from "node:crypto";
import { IUserDataStorageVisibilityGroup } from "../UserDataStorageVisibilityGroup";

export const userDataStorageVisibilityGroupCreateDTOToUserDataStorageVisibilityGroup = (
  userDataStorageVisibilityGroupCreateDTO: IUserDataStorageVisibilityGroupCreateDTO,
  visibilityGroupId: UUID,
  AESKeySaltLength: number,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroup => {
  logger?.debug("Converting User Data Storage Visibility Group Create DTO to User Data Storage Visibility Group.");
  const AESKeySalt: Buffer = randomBytes(AESKeySaltLength);
  return {
    visibilityGroupId: visibilityGroupId,
    userId: userDataStorageVisibilityGroupCreateDTO.userId as UUID,
    name: userDataStorageVisibilityGroupCreateDTO.name,
    password: userDataStorageVisibilityGroupCreateDTO.password,
    description: userDataStorageVisibilityGroupCreateDTO.description,
    AESKeySalt: AESKeySalt.toString("base64")
  } satisfies IUserDataStorageVisibilityGroup;
};
