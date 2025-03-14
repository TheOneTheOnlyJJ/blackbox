import { IUserDataStorageVisibilityGroupCreateDTO } from "@shared/user/data/storage/visibilityGroup/create/DTO/UserDataStorageVisibilityGroupCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataStorageVisibilityGroupCreateInput } from "../UserDataStorageVisibilityGroupCreateInput";

export const userDataStorageVisibilityGroupCreateInputToUserDataStorageVisibilityGroupCreateDTO = (
  userIdToAddTo: string,
  userDataStorageVisibilityGroupCreateInput: IUserDataStorageVisibilityGroupCreateInput,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupCreateDTO => {
  logger?.debug("Converting User Data Storage Visibility Group Create Input to User Data Storage Visibility Group Create DTO.");
  return {
    userId: userIdToAddTo,
    name: userDataStorageVisibilityGroupCreateInput.name,
    password: userDataStorageVisibilityGroupCreateInput.password,
    description: userDataStorageVisibilityGroupCreateInput.description ?? null
  } satisfies IUserDataStorageVisibilityGroupCreateDTO;
};
