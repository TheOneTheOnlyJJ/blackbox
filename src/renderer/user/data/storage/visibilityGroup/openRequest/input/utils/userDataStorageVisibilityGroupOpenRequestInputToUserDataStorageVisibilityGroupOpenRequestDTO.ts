import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupOpenRequestInput } from "../UserDataStorageVisibilityGroupOpenRequestInput";
import { LogFunctions } from "electron-log";

export const userDataStorageVisibilityGroupOpenRequestInputToUserDataStorageVisibilityGroupOpenRequestDTO = (
  userIdToOpenFor: string,
  userDataStorageVisibilityGroupOpenInput: IUserDataStorageVisibilityGroupOpenRequestInput,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupsOpenRequestDTO => {
  logger?.debug("Converting User Data Storage Visibility Group Open Request Input to User Data Storage Visibility Group Open Request DTO.");
  return {
    userIdToOpenFor: userIdToOpenFor,
    password: userDataStorageVisibilityGroupOpenInput.password
  } satisfies IUserDataStorageVisibilityGroupsOpenRequestDTO;
};
