import { LogFunctions } from "electron-log";
import { IUserDataStorageVisibilityGroup } from "../UserDataStorageVisibilityGroup";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";

export const userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo = (
  userDataStorageVisibilityGroup: IUserDataStorageVisibilityGroup,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupInfo => {
  logger?.debug("Converting User Data Storage Visibility Group to User Data Storage Visibility Group Info.");
  return {
    visibilityGroupId: userDataStorageVisibilityGroup.visibilityGroupId,
    name: userDataStorageVisibilityGroup.name,
    description: userDataStorageVisibilityGroup.description
  } satisfies IUserDataStorageVisibilityGroupInfo;
};
