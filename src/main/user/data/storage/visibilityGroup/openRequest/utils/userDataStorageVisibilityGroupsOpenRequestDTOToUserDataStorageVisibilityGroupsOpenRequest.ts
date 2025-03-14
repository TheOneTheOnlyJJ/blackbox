import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "../UserDataStorageVisibilityGroupsOpenRequest";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export const userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest = (
  userDataStorageVisibilityGroupsOpenRequestDTO: IUserDataStorageVisibilityGroupsOpenRequestDTO,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupsOpenRequest => {
  logger?.debug("Converting User Data Storage Visibility Groups Open Request DTO to User Data Storage Visibility Groups Open Request.");
  return {
    userIdToOpenFor: userDataStorageVisibilityGroupsOpenRequestDTO.userIdToOpenFor as UUID,
    password: userDataStorageVisibilityGroupsOpenRequestDTO.password
  } satisfies IUserDataStorageVisibilityGroupsOpenRequest;
};
