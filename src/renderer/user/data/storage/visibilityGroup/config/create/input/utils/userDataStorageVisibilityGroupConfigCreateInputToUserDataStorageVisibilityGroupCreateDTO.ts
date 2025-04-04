import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataStorageVisibilityGroupConfigCreateInput } from "../UserDataStorageVisibilityGroupConfigCreateInput";

export const userDataStorageVisibilityGroupConfigCreateInputToUserDataStorageVisibilityGroupConfigCreateDTO = (
  userIdToAddTo: string,
  userDataStorageVisibilityGroupConfigCreateInput: IUserDataStorageVisibilityGroupConfigCreateInput,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupConfigCreateDTO => {
  logger?.debug("Converting User Data Storage Visibility Group Config Create Input to User Data Storage Visibility Group Config Create DTO.");
  return {
    userId: userIdToAddTo,
    name: userDataStorageVisibilityGroupConfigCreateInput.name,
    password: userDataStorageVisibilityGroupConfigCreateInput.password,
    description: userDataStorageVisibilityGroupConfigCreateInput.description ?? null
  } satisfies IUserDataStorageVisibilityGroupConfigCreateDTO;
};
